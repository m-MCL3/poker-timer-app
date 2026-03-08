import { createDefaultBlindGroups } from "@/domain/models/blinds";
import { createInitialTimerRuntime, type TimerRuntime, type TimerStatus } from "@/domain/models/timerRuntime";
import {
  assertTimerStructure,
  buildDerivedItemName,
  cloneTimerStructure,
  countLevelsUpToIndex,
  type LevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import type { Clock } from "@/usecases/ports/clock";
import type { CancelableTask, IntervalScheduler } from "@/usecases/ports/intervalScheduler";
import type { TimerRuntimeStore, TimerSessionState } from "@/usecases/ports/runtimeStore";
import { createBlindGroupSnapshot, type TimerSnapshot } from "@/usecases/timer/timerSnapshot";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(state: TimerSessionState): TimerItem {
  return state.structure.items[state.runtime.currentIndex] ?? state.structure.items[0];
}

function currentItemDurationMs(state: TimerSessionState): number {
  return currentItem(state).durationSec * 1000;
}

function computeRemainingMs(state: TimerSessionState, nowEpochMs: number): number {
  if (state.runtime.status === "running") {
    return clampNonNegative((state.runtime.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
  }

  if (state.runtime.status === "paused") {
    return clampNonNegative(
      state.runtime.remainingMsWhenPaused ?? currentItemDurationMs(state),
    );
  }

  if (state.runtime.status === "idle") {
    return currentItemDurationMs(state);
  }

  return 0;
}

function buildBlindText(item: LevelItem): string {
  return item.blindGroups
    .map((group) => {
      const sb = group.values.sb === null || group.values.sb === 0 ? "-" : String(group.values.sb);
      const bb = group.values.bb === null || group.values.bb === 0 ? "-" : String(group.values.bb);
      const ante =
        group.values.ante === null || group.values.ante === 0
          ? "-"
          : String(group.values.ante);

      return `${group.gameKind.toUpperCase()}: ${sb} / ${bb} / ${ante}`;
    })
    .join(" | ");
}

function buildNextItemText(structure: TimerStructure, itemIndex: number): string {
  const nextItem = structure.items[itemIndex + 1];
  if (!nextItem) {
    return "最終項目です";
  }

  if (nextItem.kind === "break") {
    return "BREAK";
  }

  return `LEVEL ${countLevelsUpToIndex(structure, itemIndex + 1)} | ${buildBlindText(
    nextItem,
  )}`;
}

function computeNextBreakRemainingMs(
  state: TimerSessionState,
  nowEpochMs: number,
): number | null {
  const activeItem = currentItem(state);
  if (activeItem.kind === "break") {
    return 0;
  }

  let totalMs = computeRemainingMs(state, nowEpochMs);
  for (
    let index = state.runtime.currentIndex + 1;
    index < state.structure.items.length;
    index += 1
  ) {
    const item = state.structure.items[index];
    if (item.kind === "break") {
      return totalMs;
    }
    totalMs += item.durationSec * 1000;
  }

  return null;
}

function withRuntime(state: TimerSessionState, runtime: TimerRuntime): TimerSessionState {
  return {
    structure: state.structure,
    runtime,
  };
}

function moveToItem(input: {
  state: TimerSessionState;
  itemIndex: number;
  nowEpochMs: number;
}): TimerSessionState {
  const targetItem = input.state.structure.items[input.itemIndex];
  const durationMs = targetItem ? targetItem.durationSec * 1000 : 0;
  const baseStatus: TimerStatus =
    input.state.runtime.status === "finished"
      ? "idle"
      : input.state.runtime.status;

  if (baseStatus === "running") {
    return withRuntime(input.state, {
      status: "running",
      currentIndex: input.itemIndex,
      startedAtEpochMs: input.nowEpochMs,
      endsAtEpochMs: input.nowEpochMs + durationMs,
      remainingMsWhenPaused: null,
    });
  }

  if (baseStatus === "paused") {
    return withRuntime(input.state, {
      status: "paused",
      currentIndex: input.itemIndex,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      remainingMsWhenPaused: durationMs,
    });
  }

  return withRuntime(input.state, {
    status: "idle",
    currentIndex: input.itemIndex,
    startedAtEpochMs: null,
    endsAtEpochMs: null,
    remainingMsWhenPaused: null,
  });
}

function advanceRunningTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  if (input.state.runtime.status !== "running") {
    return input.state;
  }

  let nextState = input.state;
  while (nextState.runtime.status === "running") {
    const remainingMs = computeRemainingMs(nextState, input.nowEpochMs);
    if (remainingMs > 0) {
      return nextState;
    }

    const nextIndex = nextState.runtime.currentIndex + 1;
    if (nextIndex >= nextState.structure.items.length) {
      return withRuntime(nextState, {
        status: "finished",
        currentIndex: nextState.runtime.currentIndex,
        startedAtEpochMs: null,
        endsAtEpochMs: null,
        remainingMsWhenPaused: null,
      });
    }

    const nextItem = nextState.structure.items[nextIndex];
    const startEpochMs = nextState.runtime.endsAtEpochMs ?? input.nowEpochMs;

    nextState = withRuntime(nextState, {
      status: "running",
      currentIndex: nextIndex,
      startedAtEpochMs: startEpochMs,
      endsAtEpochMs: startEpochMs + nextItem.durationSec * 1000,
      remainingMsWhenPaused: null,
    });
  }

  return nextState;
}

function syncState(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  return advanceRunningTimer(input);
}

function startTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  return withRuntime(synced, {
    status: "running",
    currentIndex: synced.runtime.currentIndex,
    startedAtEpochMs: input.nowEpochMs,
    endsAtEpochMs: input.nowEpochMs + currentItemDurationMs(synced),
    remainingMsWhenPaused: null,
  });
}

function pauseTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  if (synced.runtime.status !== "running") {
    return synced;
  }

  return withRuntime(synced, {
    status: "paused",
    currentIndex: synced.runtime.currentIndex,
    startedAtEpochMs: null,
    endsAtEpochMs: null,
    remainingMsWhenPaused: computeRemainingMs(synced, input.nowEpochMs),
  });
}

function resumeTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  const remainingMs =
    synced.runtime.remainingMsWhenPaused ?? currentItemDurationMs(synced);

  return withRuntime(synced, {
    status: "running",
    currentIndex: synced.runtime.currentIndex,
    startedAtEpochMs: input.nowEpochMs,
    endsAtEpochMs: input.nowEpochMs + remainingMs,
    remainingMsWhenPaused: null,
  });
}

function toggleTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);

  if (synced.runtime.status === "idle") {
    return startTimer({ state: synced, nowEpochMs: input.nowEpochMs });
  }

  if (synced.runtime.status === "running") {
    return pauseTimer({ state: synced, nowEpochMs: input.nowEpochMs });
  }

  if (synced.runtime.status === "paused") {
    return resumeTimer({ state: synced, nowEpochMs: input.nowEpochMs });
  }

  return {
    structure: synced.structure,
    runtime: createInitialTimerRuntime(),
  };
}

function tickTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  return syncState(input);
}

function resetTimer(state: TimerSessionState): TimerSessionState {
  return {
    structure: state.structure,
    runtime: createInitialTimerRuntime(),
  };
}

function goToNextItem(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  const nextIndex = synced.runtime.currentIndex + 1;
  if (nextIndex >= synced.structure.items.length) {
    return synced;
  }
  return moveToItem({
    state: synced,
    itemIndex: nextIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

function goToPreviousItem(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  const previousIndex = synced.runtime.currentIndex - 1;
  if (previousIndex < 0) {
    return synced;
  }
  return moveToItem({
    state: synced,
    itemIndex: previousIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

function applyEditedStructure(input: {
  state: TimerSessionState;
  structure: TimerStructure;
}): TimerSessionState {
  if (input.state.runtime.status === "running") {
    throw new Error("Timer is running. Structure cannot be applied.");
  }

  const structure = assertTimerStructure(cloneTimerStructure(input.structure));
  const currentIndex = Math.min(
    input.state.runtime.currentIndex,
    structure.items.length - 1,
  );
  const currentItem = structure.items[currentIndex];
  const currentDurationMs = currentItem ? currentItem.durationSec * 1000 : 0;

  if (input.state.runtime.status === "paused") {
    return {
      structure,
      runtime: {
        status: "paused",
        currentIndex,
        startedAtEpochMs: null,
        endsAtEpochMs: null,
        remainingMsWhenPaused: Math.min(
          input.state.runtime.remainingMsWhenPaused ?? currentDurationMs,
          currentDurationMs,
        ),
      },
    };
  }

  if (input.state.runtime.status === "finished") {
    return {
      structure,
      runtime: createInitialTimerRuntime(),
    };
  }

  return {
    structure,
    runtime: {
      status: input.state.runtime.status,
      currentIndex,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      remainingMsWhenPaused: null,
    },
  };
}

function loadPresetStructure(input: {
  structure: TimerStructure;
}): TimerSessionState {
  const structure = assertTimerStructure(cloneTimerStructure(input.structure));

  return {
    structure,
    runtime: createInitialTimerRuntime(),
  };
}

function createSnapshot(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSnapshot {
  const synced = syncState(input);
  const item = currentItem(synced);

  return {
    title: synced.structure.name,
    status: synced.runtime.status,
    currentItemIndex: synced.runtime.currentIndex,
    currentItemNumber: synced.runtime.currentIndex + 1,
    totalItemCount: synced.structure.items.length,
    currentItemKind: item.kind,
    currentItemLabel: buildDerivedItemName(
      synced.structure,
      synced.runtime.currentIndex,
    ),
    remainingMs: computeRemainingMs(synced, input.nowEpochMs),
    showBreakBanner: item.kind === "break",
    showCurrentBlinds: item.kind === "level",
    currentBlindGroups:
      item.kind === "level"
        ? createBlindGroupSnapshot(item.blindGroups)
        : createBlindGroupSnapshot(createDefaultBlindGroups()),
    nextItemText: buildNextItemText(synced.structure, synced.runtime.currentIndex),
    nextBreakRemainingMs: computeNextBreakRemainingMs(synced, input.nowEpochMs),
  };
}

export class TimerUsecase {
  private tickerTask: CancelableTask | null = null;

  constructor(
    private readonly deps: {
      clock: Clock;
      store: TimerRuntimeStore;
      scheduler: IntervalScheduler;
    },
  ) {}

  subscribe(listener: () => void): () => void {
    return this.deps.store.subscribe(listener);
  }

  getSnapshot(): TimerSnapshot {
    return createSnapshot({
      state: this.deps.store.getState(),
      nowEpochMs: this.deps.clock.nowEpochMs(),
    });
  }

  getStructure(): TimerStructure {
    return cloneTimerStructure(this.deps.store.getState().structure);
  }

  getStatus(): TimerStatus {
    return this.deps.store.getState().runtime.status;
  }

  isEditable(): boolean {
    return this.getStatus() !== "running";
  }

  startAutoTick(intervalMs = 250): () => void {
    this.stopAutoTick();
    this.tickerTask = this.deps.scheduler.start(() => {
      this.deps.store.setState(
        tickTimer({
          state: this.deps.store.getState(),
          nowEpochMs: this.deps.clock.nowEpochMs(),
        }),
      );
    }, intervalMs);

    return () => this.stopAutoTick();
  }

  stopAutoTick(): void {
    if (!this.tickerTask) {
      return;
    }
    this.tickerTask.cancel();
    this.tickerTask = null;
  }

  toggle(): void {
    this.deps.store.setState(
      toggleTimer({
        state: this.deps.store.getState(),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  goToNextItem(): void {
    this.deps.store.setState(
      goToNextItem({
        state: this.deps.store.getState(),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  goToPreviousItem(): void {
    this.deps.store.setState(
      goToPreviousItem({
        state: this.deps.store.getState(),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  reset(): void {
    this.deps.store.setState(resetTimer(this.deps.store.getState()));
  }

  loadStructure(structure: TimerStructure): void {
    this.applyEditedStructure(structure);
  }

  applyEditedStructure(structure: TimerStructure): void {
    this.deps.store.setState(
      applyEditedStructure({
        state: this.deps.store.getState(),
        structure,
      }),
    );
  }

  loadPresetStructure(structure: TimerStructure): void {
    this.deps.store.setState(loadPresetStructure({ structure }));
  }
}
