import { GAME_KIND_ORDER } from "@/domain/entities/blinds";
import {
  buildDerivedItemName,
  cloneTournamentStructure,
  itemDurationMs,
  type TournamentStructure,
  type TournamentStructureItem,
} from "@/domain/entities/tournamentStructure";
import {
  createInitialTimerState,
  type TimerState,
  type TimerStatus,
} from "@/domain/entities/timerState";
import type { Clock } from "@/usecases/ports/clock";
import type { RuntimeStore } from "@/usecases/ports/runtimeStore";
import {
  createBlindGroupSnapshot,
  formatDurationText,
  formatNextBreakText,
  type TimerSnapshot,
} from "@/usecases/timer/timerSnapshot";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(state: TimerState): TournamentStructureItem {
  return (
    state.structure.items[state.currentItemIndex] ??
    state.structure.items[0]
  );
}

function remainingMs(state: TimerState, nowEpochMs: number): number {
  const item = currentItem(state);
  const totalMs = itemDurationMs(item);

  switch (state.status) {
    case "running":
      return clampNonNegative((state.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
    case "paused":
      return clampNonNegative(state.pausedRemainingMs ?? totalMs);
    case "idle":
      return totalMs;
    case "finished":
      return 0;
  }
}

function withState(state: TimerState, patch: Partial<TimerState>): TimerState {
  return {
    ...state,
    ...patch,
  };
}

function moveToItem(
  state: TimerState,
  itemIndex: number,
  nowEpochMs: number,
): TimerState {
  const item = state.structure.items[itemIndex];
  if (!item) {
    return state;
  }

  const durationMs = itemDurationMs(item);
  const baseStatus: TimerStatus = state.status === "finished" ? "idle" : state.status;

  if (baseStatus === "running") {
    return {
      ...state,
      currentItemIndex: itemIndex,
      endsAtEpochMs: nowEpochMs + durationMs,
      pausedRemainingMs: null,
      status: "running",
    };
  }

  if (baseStatus === "paused") {
    return {
      ...state,
      currentItemIndex: itemIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: durationMs,
      status: "paused",
    };
  }

  return {
    ...state,
    currentItemIndex: itemIndex,
    endsAtEpochMs: null,
    pausedRemainingMs: null,
    status: "idle",
  };
}

function syncRunningState(state: TimerState, nowEpochMs: number): TimerState {
  if (state.status !== "running") {
    return state;
  }

  let nextState = state;

  while (nextState.status === "running") {
    const currentRemaining = remainingMs(nextState, nowEpochMs);
    if (currentRemaining > 0) {
      return nextState;
    }

    const nextIndex = nextState.currentItemIndex + 1;
    if (nextIndex >= nextState.structure.items.length) {
      return {
        ...nextState,
        status: "finished",
        endsAtEpochMs: null,
        pausedRemainingMs: null,
      };
    }

    const durationMs = itemDurationMs(nextState.structure.items[nextIndex]!);
    const carryEpochMs = nextState.endsAtEpochMs ?? nowEpochMs;

    nextState = {
      ...nextState,
      currentItemIndex: nextIndex,
      status: "running",
      endsAtEpochMs: carryEpochMs + durationMs,
      pausedRemainingMs: null,
    };
  }

  return nextState;
}

function startTimer(state: TimerState, nowEpochMs: number): TimerState {
  const synced = syncRunningState(state, nowEpochMs);
  const durationMs = itemDurationMs(currentItem(synced));
  return withState(synced, {
    status: "running",
    endsAtEpochMs: nowEpochMs + durationMs,
    pausedRemainingMs: null,
  });
}

function pauseTimer(state: TimerState, nowEpochMs: number): TimerState {
  const synced = syncRunningState(state, nowEpochMs);
  if (synced.status !== "running") {
    return synced;
  }

  return withState(synced, {
    status: "paused",
    endsAtEpochMs: null,
    pausedRemainingMs: remainingMs(synced, nowEpochMs),
  });
}

function resumeTimer(state: TimerState, nowEpochMs: number): TimerState {
  const synced = syncRunningState(state, nowEpochMs);
  const totalMs = itemDurationMs(currentItem(synced));
  const remain = synced.pausedRemainingMs ?? totalMs;
  return withState(synced, {
    status: "running",
    endsAtEpochMs: nowEpochMs + remain,
    pausedRemainingMs: null,
  });
}

function nextBreakRemainingMs(state: TimerState, nowEpochMs: number): number | null {
  const activeItem = currentItem(state);
  if (activeItem.kind === "break") {
    return 0;
  }

  let totalMs = remainingMs(state, nowEpochMs);
  for (let index = state.currentItemIndex + 1; index < state.structure.items.length; index += 1) {
    const item = state.structure.items[index]!;
    if (item.kind === "break") {
      return totalMs;
    }
    totalMs += itemDurationMs(item);
  }

  return null;
}

function nextItemText(state: TimerState): string {
  const nextItem = state.structure.items[state.currentItemIndex + 1];
  if (!nextItem) {
    return "最終項目です";
  }

  return buildDerivedItemName(state.structure, state.currentItemIndex + 1);
}

export class TimerUsecase {
  constructor(
    private readonly deps: {
      clock: Clock;
      store: RuntimeStore;
    },
  ) {}

  subscribe(listener: () => void): () => void {
    return this.deps.store.subscribe(listener);
  }

  getSnapshot(): TimerSnapshot {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    const synced = syncRunningState(this.deps.store.getState(), nowEpochMs);
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
      currentItemLabel: buildDerivedItemName(synced.structure, synced.currentItemIndex),
      remainingMs: currentRemainingMs,
      remainingText: formatDurationText(currentRemainingMs),
      showBreakBanner: item.kind === "break",
      showCurrentBlinds: item.kind === "level",
      currentBlindGroups:
        item.kind === "level"
          ? createBlindGroupSnapshot(
              GAME_KIND_ORDER.map((gameKind) => ({
                gameKind,
                sb: item.blinds[gameKind].sb,
                bb: item.blinds[gameKind].bb,
                ante: item.blinds[gameKind].ante,
              })),
            )
          : [],
      nextItemText: nextItemText(synced),
      nextBreakRemainingMs: nextBreakRemainingMs(synced, nowEpochMs),
      nextBreakText: formatNextBreakText(nextBreakRemainingMs(synced, nowEpochMs)),
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };
  }

  getStructure(): TournamentStructure {
    return cloneTournamentStructure(this.deps.store.getState().structure);
  }

  getStatus(): TimerStatus {
    return this.deps.store.getState().status;
  }

  isEditable(): boolean {
    return this.getStatus() !== "running";
  }

  tick(): void {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    this.deps.store.setState(syncRunningState(this.deps.store.getState(), nowEpochMs));
  }

  toggle(): void {
    const state = this.deps.store.getState();
    const nowEpochMs = this.deps.clock.nowEpochMs();

    switch (state.status) {
      case "idle":
        this.deps.store.setState(startTimer(state, nowEpochMs));
        return;
      case "running":
        this.deps.store.setState(pauseTimer(state, nowEpochMs));
        return;
      case "paused":
        this.deps.store.setState(resumeTimer(state, nowEpochMs));
        return;
      case "finished":
        this.deps.store.setState(createInitialTimerState(state.structure));
        return;
    }
  }

  goToNextItem(): void {
    const state = syncRunningState(
      this.deps.store.getState(),
      this.deps.clock.nowEpochMs(),
    );
    const nextIndex = state.currentItemIndex + 1;
    if (nextIndex >= state.structure.items.length) {
      this.deps.store.setState(state);
      return;
    }

    this.deps.store.setState(
      moveToItem(state, nextIndex, this.deps.clock.nowEpochMs()),
    );
  }

  goToPreviousItem(): void {
    const state = syncRunningState(
      this.deps.store.getState(),
      this.deps.clock.nowEpochMs(),
    );
    const previousIndex = state.currentItemIndex - 1;
    if (previousIndex < 0) {
      this.deps.store.setState(state);
      return;
    }

    this.deps.store.setState(
      moveToItem(state, previousIndex, this.deps.clock.nowEpochMs()),
    );
  }

  reset(): void {
    const state = this.deps.store.getState();
    this.deps.store.setState(createInitialTimerState(state.structure));
  }

  applyEditedStructure(structure: TournamentStructure): void {
    const current = this.deps.store.getState();
    if (current.status === "running") {
      throw new Error("Timer is running. Structure cannot be applied.");
    }

    const nextStructure = cloneTournamentStructure(structure);
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

    if (current.status === "finished") {
      this.deps.store.setState(createInitialTimerState(nextStructure));
      return;
    }

    this.deps.store.setState({
      structure: nextStructure,
      status: current.status,
      currentItemIndex: currentIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: null,
    });
  }

  loadPresetStructure(structure: TournamentStructure): void {
    this.deps.store.setState(createInitialTimerState(cloneTournamentStructure(structure)));
  }
}
