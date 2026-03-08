import { createDefaultBlindGroups } from "@/domain/models/blinds";
import {
  createInitialTimerRuntime,
  type TimerRuntime,
  type TimerStatus,
} from "@/domain/models/timerRuntime";
import {
  assertTimerStructure,
  cloneTimerStructure,
  type LevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import type { Clock } from "@/usecases/ports/clock";
import type { CancelableTask, IntervalScheduler } from "@/usecases/ports/intervalScheduler";
import type { TimerRuntimeStore, TimerSessionState } from "@/usecases/ports/timerRuntimeStore";
import type { TimerSnapshot } from "@/usecases/timer/timerSnapshot";
import { createBlindGroupSnapshot } from "@/usecases/timer/timerSnapshot";

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

function countLevelsUpToIndex(structure: TimerStructure, itemIndex: number): number {
  let levelCount = 0;
  for (let index = 0; index <= itemIndex; index += 1) {
    if (structure.items[index]?.kind === "level") {
      levelCount += 1;
    }
  }
  return Math.max(levelCount, 1);
}

function buildBlindText(item: LevelItem): string {
  return item.blindGroups
    .map((group) => {
      const sb = group.values.sb === null || group.values.sb === 0 ? "-" : String(group.values.sb);
      const bb = group.values.bb === null || group.values.bb === 0 ? "-" : String(group.values.bb);
      const ante =
        group.values.ante === null || group.values.ante === 0 ? "-" : String(group.values.ante);
      return `${group.gameKind.toUpperCase()}: ${sb} / ${bb} / ${ante}`;
    })
    .join(" | ");
}

function buildCurrentItemLabel(structure: TimerStructure, itemIndex: number): string {
  const item = structure.items[itemIndex];
  if (!item) {
    return "";
  }

  if (item.kind === "break") {
    return "BREAK";
  }

  return `LEVEL ${countLevelsUpToIndex(structure, itemIndex)}`;
}

function buildNextItemText(structure: TimerStructure, itemIndex: number): string {
  const nextItem = structure.items[itemIndex + 1];
  if (!nextItem) {
    return "最終項目です";
  }

  if (nextItem.kind === "break") {
    return "BREAK";
  }

  return `LEVEL ${countLevelsUpToIndex(structure, itemIndex + 1)} | ${buildBlindText(nextItem)}`;
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
  for (let index = state.runtime.currentIndex + 1; index < state.structure.items.length; index += 1) {
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
  const durationMs = input.state.structure.items[input.itemIndex]?.durationSec * 1000 ?? 0;
  const baseStatus: TimerStatus =
    input.state.runtime.status === "finished" ? "idle" : input.state.runtime.status;

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
    nextState = withRuntime(nextState, {
      status: "running",
      currentIndex: nextIndex,
      startedAtEpochMs: nextState.runtime.endsAtEpochMs ?? input.nowEpochMs,
      endsAtEpochMs:
        (nextState.runtime.endsAtEpochMs ?? input.nowEpochMs) + nextItem.durationSec * 1000,
      remainingMsWhenPaused: null,
    });
  }

  return nextState;
}

function syncTimerState(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  return advanceRunningTimer(input);
}

function startTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const syncedState = syncTimerState(input);
  return withRuntime(syncedState, {
    status: "running",
    currentIndex: syncedState.runtime.currentIndex,
    startedAtEpochMs: input.nowEpochMs,
    endsAtEpochMs: input.nowEpochMs + currentItemDurationMs(syncedState),
    remainingMsWhenPaused: null,
  });
}

function pauseTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const syncedState = syncTimerState(input);
  if (syncedState.runtime.status !== "running") {
    return syncedState;
  }

  return withRuntime(syncedState, {
    status: "paused",
    currentIndex: syncedState.runtime.currentIndex,
    startedAtEpochMs: null,
    endsAtEpochMs: null,
    remainingMsWhenPaused: computeRemainingMs(syncedState, input.nowEpochMs),
  });
}

function resumeTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const syncedState = syncTimerState(input);
  const remainingMs =
    syncedState.runtime.remainingMsWhenPaused ?? currentItemDurationMs(syncedState);

  return withRuntime(syncedState, {
    status: "running",
    currentIndex: syncedState.runtime.currentIndex,
    startedAtEpochMs: input.nowEpochMs,
    endsAtEpochMs: input.nowEpochMs + remainingMs,
    remainingMsWhenPaused: null,
  });
}

function toggleTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const syncedState = syncTimerState(input);

  if (syncedState.runtime.status === "idle") {
    return startTimer({ state: syncedState, nowEpochMs: input.nowEpochMs });
  }

  if (syncedState.runtime.status === "running") {
    return pauseTimer({ state: syncedState, nowEpochMs: input.nowEpochMs });
  }

  if (syncedState.runtime.status === "paused") {
    return resumeTimer({ state: syncedState, nowEpochMs: input.nowEpochMs });
  }

  return {
    structure: syncedState.structure,
    runtime: createInitialTimerRuntime(),
  };
}

function tickTimer(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  return syncTimerState(input);
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
  const syncedState = syncTimerState(input);
  const nextIndex = syncedState.runtime.currentIndex + 1;
  if (nextIndex >= syncedState.structure.items.length) {
    return syncedState;
  }
  return moveToItem({ state: syncedState, itemIndex: nextIndex, nowEpochMs: input.nowEpochMs });
}

function goToPreviousItem(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSessionState {
  const syncedState = syncTimerState(input);
  const previousIndex = syncedState.runtime.currentIndex - 1;
  if (previousIndex < 0) {
    return syncedState;
  }
  return moveToItem({ state: syncedState, itemIndex: previousIndex, nowEpochMs: input.nowEpochMs });
}

function replaceTimerStructure(input: {
  state: TimerSessionState;
  structure: TimerStructure;
}): TimerSessionState {
  if (input.state.runtime.status === "running") {
    throw new Error("Timer is running. Structure cannot be applied.");
  }

  const structure = assertTimerStructure(cloneTimerStructure(input.structure));
  const currentIndex = Math.min(input.state.runtime.currentIndex, structure.items.length - 1);
  const currentDurationMs = structure.items[currentIndex]?.durationSec * 1000 ?? 0;

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

function createTimerSnapshot(input: {
  state: TimerSessionState;
  nowEpochMs: number;
}): TimerSnapshot {
  const syncedState = syncTimerState(input);
  const item = currentItem(syncedState);

  return {
    title: syncedState.structure.name,
    status: syncedState.runtime.status,
    currentItemIndex: syncedState.runtime.currentIndex,
    currentItemNumber: syncedState.runtime.currentIndex + 1,
    totalItemCount: syncedState.structure.items.length,
    currentItemKind: item.kind,
    currentItemLabel: buildCurrentItemLabel(
      syncedState.structure,
      syncedState.runtime.currentIndex,
    ),
    remainingMs: computeRemainingMs(syncedState, input.nowEpochMs),
    showBreakBanner: item.kind === "break",
    showCurrentBlinds: item.kind === "level",
    currentBlindGroups:
      item.kind === "level"
        ? createBlindGroupSnapshot(item.blindGroups)
        : createBlindGroupSnapshot(createDefaultBlindGroups()),
    nextItemText: buildNextItemText(syncedState.structure, syncedState.runtime.currentIndex),
    nextBreakRemainingMs: computeNextBreakRemainingMs(syncedState, input.nowEpochMs),
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
    return createTimerSnapshot({
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

    return () => {
      this.stopAutoTick();
    };
  }

  stopAutoTick(): void {
    if (this.tickerTask) {
      this.tickerTask.cancel();
      this.tickerTask = null;
    }
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
    this.deps.store.setState(
      replaceTimerStructure({
        state: this.deps.store.getState(),
        structure,
      }),
    );
  }
}
