import { GAME_KIND_ORDER } from "@/domain/blinds";
import { cloneStructure, buildItemLabel, itemDurationMs, type TournamentStructure, type StructureItem } from "@/domain/tournamentStructure";
import { createInitialTimerSession, type TimerSession, type TimerStatus } from "@/domain/timerSession";
import type { Clock } from "@/application/shared/ports/Clock";
import type { RuntimeStore } from "@/application/shared/ports/RuntimeStore";
import { createBlindGroupView, formatDurationText, formatNextBreakText, type TimerView } from "@/application/timer/timerView";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(session: TimerSession): StructureItem {
  return session.structure.items[session.currentItemIndex] ?? session.structure.items[0]!;
}

function remainingMs(session: TimerSession, nowEpochMs: number): number {
  const item = currentItem(session);
  const totalMs = itemDurationMs(item);

  switch (session.status) {
    case "running":
      return clampNonNegative((session.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
    case "paused":
      return clampNonNegative(session.pausedRemainingMs ?? totalMs);
    case "idle":
      return totalMs;
    case "finished":
      return 0;
  }
}

function moveToItem(session: TimerSession, itemIndex: number, nowEpochMs: number): TimerSession {
  const item = session.structure.items[itemIndex];
  if (!item) {
    return session;
  }

  const durationMs = itemDurationMs(item);
  const baseStatus: TimerStatus = session.status === "finished" ? "idle" : session.status;

  if (baseStatus === "running") {
    return {
      ...session,
      currentItemIndex: itemIndex,
      endsAtEpochMs: nowEpochMs + durationMs,
      pausedRemainingMs: null,
      status: "running",
    };
  }

  if (baseStatus === "paused") {
    return {
      ...session,
      currentItemIndex: itemIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: durationMs,
      status: "paused",
    };
  }

  return {
    ...session,
    currentItemIndex: itemIndex,
    endsAtEpochMs: null,
    pausedRemainingMs: null,
    status: "idle",
  };
}

function syncRunningSession(session: TimerSession, nowEpochMs: number): TimerSession {
  if (session.status !== "running") {
    return session;
  }

  let nextSession = session;

  while (nextSession.status === "running") {
    const currentRemaining = remainingMs(nextSession, nowEpochMs);
    if (currentRemaining > 0) {
      return nextSession;
    }

    const nextIndex = nextSession.currentItemIndex + 1;
    if (nextIndex >= nextSession.structure.items.length) {
      return {
        ...nextSession,
        status: "finished",
        endsAtEpochMs: null,
        pausedRemainingMs: null,
      };
    }

    const durationMs = itemDurationMs(nextSession.structure.items[nextIndex]!);
    const carryEpochMs = nextSession.endsAtEpochMs ?? nowEpochMs;
    nextSession = {
      ...nextSession,
      currentItemIndex: nextIndex,
      status: "running",
      endsAtEpochMs: carryEpochMs + durationMs,
      pausedRemainingMs: null,
    };
  }

  return nextSession;
}

function startTimer(session: TimerSession, nowEpochMs: number): TimerSession {
  const synced = syncRunningSession(session, nowEpochMs);
  const durationMs = itemDurationMs(currentItem(synced));
  return {
    ...synced,
    status: "running",
    endsAtEpochMs: nowEpochMs + durationMs,
    pausedRemainingMs: null,
  };
}

function pauseTimer(session: TimerSession, nowEpochMs: number): TimerSession {
  const synced = syncRunningSession(session, nowEpochMs);
  if (synced.status !== "running") {
    return synced;
  }

  return {
    ...synced,
    status: "paused",
    endsAtEpochMs: null,
    pausedRemainingMs: remainingMs(synced, nowEpochMs),
  };
}

function resumeTimer(session: TimerSession, nowEpochMs: number): TimerSession {
  const synced = syncRunningSession(session, nowEpochMs);
  const totalMs = itemDurationMs(currentItem(synced));
  const remain = synced.pausedRemainingMs ?? totalMs;
  return {
    ...synced,
    status: "running",
    endsAtEpochMs: nowEpochMs + remain,
    pausedRemainingMs: null,
  };
}

function nextBreakRemainingMs(session: TimerSession, nowEpochMs: number): number | null {
  const activeItem = currentItem(session);
  if (activeItem.kind === "break") {
    return 0;
  }

  let totalMs = remainingMs(session, nowEpochMs);
  for (let index = session.currentItemIndex + 1; index < session.structure.items.length; index += 1) {
    const item = session.structure.items[index]!;
    if (item.kind === "break") {
      return totalMs;
    }
    totalMs += itemDurationMs(item);
  }

  return null;
}

function nextItemText(session: TimerSession): string {
  const nextItem = session.structure.items[session.currentItemIndex + 1];
  if (!nextItem) {
    return "最終項目です";
  }
  return buildItemLabel(session.structure, session.currentItemIndex + 1);
}

export class TimerService {
  constructor(
    private readonly deps: {
      clock: Clock;
      store: RuntimeStore;
    },
  ) {}

  subscribe(listener: () => void): () => void {
    return this.deps.store.subscribe(listener);
  }

  getView(): TimerView {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    const synced = syncRunningSession(this.deps.store.getState(), nowEpochMs);
    const item = currentItem(synced);
    const currentRemainingMs = remainingMs(synced, nowEpochMs);
    const totalMs = itemDurationMs(item);
    const progressPercent = totalMs <= 0 ? 0 : ((totalMs - currentRemainingMs) / totalMs) * 100;

    return {
      title: synced.structure.name,
      status: synced.status,
      currentItemIndex: synced.currentItemIndex,
      currentItemNumber: synced.currentItemIndex + 1,
      totalItemCount: synced.structure.items.length,
      currentItemKind: item.kind,
      currentItemLabel: buildItemLabel(synced.structure, synced.currentItemIndex),
      remainingMs: currentRemainingMs,
      remainingText: formatDurationText(currentRemainingMs),
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      showBreakBanner: item.kind === "break",
      currentBlindGroups:
        item.kind === "level"
          ? createBlindGroupView(
              GAME_KIND_ORDER.map((gameKind) => ({
                gameKind,
                sb: item.blinds[gameKind].sb,
                bb: item.blinds[gameKind].bb,
                ante: item.blinds[gameKind].ante,
              })),
            )
          : [],
      nextItemText: nextItemText(synced),
      nextBreakText: formatNextBreakText(nextBreakRemainingMs(synced, nowEpochMs)),
    };
  }

  getStructure(): TournamentStructure {
    return cloneStructure(this.deps.store.getState().structure);
  }

  getStatus(): TimerStatus {
    return this.deps.store.getState().status;
  }

  isEditable(): boolean {
    return this.getStatus() !== "running";
  }

  tick(): void {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    this.deps.store.setState(syncRunningSession(this.deps.store.getState(), nowEpochMs));
  }

  toggle(): void {
    const session = this.deps.store.getState();
    const nowEpochMs = this.deps.clock.nowEpochMs();

    switch (session.status) {
      case "idle":
        this.deps.store.setState(startTimer(session, nowEpochMs));
        return;
      case "running":
        this.deps.store.setState(pauseTimer(session, nowEpochMs));
        return;
      case "paused":
        this.deps.store.setState(resumeTimer(session, nowEpochMs));
        return;
      case "finished":
        this.deps.store.setState(createInitialTimerSession(session.structure));
        return;
    }
  }

  goToNextItem(): void {
    const synced = syncRunningSession(this.deps.store.getState(), this.deps.clock.nowEpochMs());
    const nextIndex = synced.currentItemIndex + 1;
    if (nextIndex >= synced.structure.items.length) {
      this.deps.store.setState(synced);
      return;
    }
    this.deps.store.setState(moveToItem(synced, nextIndex, this.deps.clock.nowEpochMs()));
  }

  goToPreviousItem(): void {
    const synced = syncRunningSession(this.deps.store.getState(), this.deps.clock.nowEpochMs());
    const previousIndex = synced.currentItemIndex - 1;
    if (previousIndex < 0) {
      this.deps.store.setState(synced);
      return;
    }
    this.deps.store.setState(moveToItem(synced, previousIndex, this.deps.clock.nowEpochMs()));
  }

  reset(): void {
    const session = this.deps.store.getState();
    this.deps.store.setState(createInitialTimerSession(session.structure));
  }

  replaceStructure(structure: TournamentStructure): void {
    const current = this.deps.store.getState();
    if (current.status === "running") {
      throw new Error("タイマー実行中は構造を差し替えできません。");
    }

    const nextStructure = cloneStructure(structure);
    const currentIndex = Math.min(current.currentItemIndex, nextStructure.items.length - 1);

    if (current.status === "paused") {
      const currentItem = nextStructure.items[currentIndex]!;
      const maxRemainingMs = itemDurationMs(currentItem);
      this.deps.store.setState({
        structure: nextStructure,
        status: "paused",
        currentItemIndex: currentIndex,
        endsAtEpochMs: null,
        pausedRemainingMs: Math.min(current.pausedRemainingMs ?? maxRemainingMs, maxRemainingMs),
      });
      return;
    }

    this.deps.store.setState(createInitialTimerSession(nextStructure));
  }

  loadStructureAsIdle(structure: TournamentStructure): void {
    const current = this.deps.store.getState();
    if (current.status === "running") {
      throw new Error("タイマー実行中はプリセットをロードできません。Pause か Reset で停止してください。");
    }

    this.deps.store.setState(createInitialTimerSession(cloneStructure(structure)));
  }
}
