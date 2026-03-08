import { createDefaultBlindGroups } from "@/domain/models/blinds";
import {
  createInitialTimerRuntime,
  type TimerRuntime,
  type TimerStatus,
} from "@/domain/models/timerRuntime";
import {
  assertTimerStructure,
  cloneTimerStructure,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import type { TimerSessionState } from "@/usecases/ports/runtimeStore";
import {
  sumDurationRangeMs,
  type StructureCache,
} from "@/usecases/timer/structureCache";
import {
  createBlindGroupSnapshot,
  formatDurationText,
  formatNextBreakText,
  type TimerSnapshot,
} from "@/usecases/timer/timerSnapshot";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(state: TimerSessionState): TimerItem {
  return state.structure.items[state.runtime.currentIndex] ?? state.structure.items[0];
}

function withRuntime(state: TimerSessionState, runtime: TimerRuntime): TimerSessionState {
  return {
    structure: state.structure,
    runtime,
  };
}

export function computeRemainingMs(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): number {
  const currentDurationMs =
    input.cache.itemDurationsMs[input.state.runtime.currentIndex] ?? 0;

  if (input.state.runtime.status === "running") {
    return clampNonNegative(
      (input.state.runtime.endsAtEpochMs ?? input.nowEpochMs) - input.nowEpochMs,
    );
  }

  if (input.state.runtime.status === "paused") {
    return clampNonNegative(
      input.state.runtime.remainingMsWhenPaused ?? currentDurationMs,
    );
  }

  if (input.state.runtime.status === "idle") {
    return currentDurationMs;
  }

  return 0;
}

function computeProgressPercent(input: {
  state: TimerSessionState;
  cache: StructureCache;
  remainingMs: number;
}): number {
  const totalDurationMs =
    input.cache.itemDurationsMs[input.state.runtime.currentIndex] ?? 0;

  if (totalDurationMs <= 0) {
    return 0;
  }

  const elapsedMs = totalDurationMs - input.remainingMs;
  return Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
}

export function computeNextBreakRemainingMs(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): number | null {
  const activeItem = currentItem(input.state);
  if (activeItem.kind === "break") {
    return 0;
  }

  const nextBreakIndex =
    input.cache.nextBreakIndexByItemIndex[input.state.runtime.currentIndex];

  if (nextBreakIndex === null) {
    return null;
  }

  const currentRemainingMs = computeRemainingMs(input);
  const betweenMs = sumDurationRangeMs(
    input.cache,
    input.state.runtime.currentIndex + 1,
    nextBreakIndex - 1,
  );

  return currentRemainingMs + betweenMs;
}

function moveToItem(input: {
  state: TimerSessionState;
  cache: StructureCache;
  itemIndex: number;
  nowEpochMs: number;
}): TimerSessionState {
  const durationMs = input.cache.itemDurationsMs[input.itemIndex] ?? 0;
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

export function syncState(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSessionState {
  if (input.state.runtime.status !== "running") {
    return input.state;
  }

  let nextState = input.state;

  while (nextState.runtime.status === "running") {
    const remainingMs = computeRemainingMs({
      state: nextState,
      cache: input.cache,
      nowEpochMs: input.nowEpochMs,
    });

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

    const nextDurationMs = input.cache.itemDurationsMs[nextIndex] ?? 0;
    const startEpochMs = nextState.runtime.endsAtEpochMs ?? input.nowEpochMs;

    nextState = withRuntime(nextState, {
      status: "running",
      currentIndex: nextIndex,
      startedAtEpochMs: startEpochMs,
      endsAtEpochMs: startEpochMs + nextDurationMs,
      remainingMsWhenPaused: null,
    });
  }

  return nextState;
}

export function toggleTimer(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);

  if (synced.runtime.status === "idle") {
    const currentDurationMs =
      input.cache.itemDurationsMs[synced.runtime.currentIndex] ?? 0;

    return withRuntime(synced, {
      status: "running",
      currentIndex: synced.runtime.currentIndex,
      startedAtEpochMs: input.nowEpochMs,
      endsAtEpochMs: input.nowEpochMs + currentDurationMs,
      remainingMsWhenPaused: null,
    });
  }

  if (synced.runtime.status === "running") {
    return withRuntime(synced, {
      status: "paused",
      currentIndex: synced.runtime.currentIndex,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      remainingMsWhenPaused: computeRemainingMs({
        state: synced,
        cache: input.cache,
        nowEpochMs: input.nowEpochMs,
      }),
    });
  }

  if (synced.runtime.status === "paused") {
    const currentDurationMs =
      input.cache.itemDurationsMs[synced.runtime.currentIndex] ?? 0;
    const remainingMs =
      synced.runtime.remainingMsWhenPaused ?? currentDurationMs;

    return withRuntime(synced, {
      status: "running",
      currentIndex: synced.runtime.currentIndex,
      startedAtEpochMs: input.nowEpochMs,
      endsAtEpochMs: input.nowEpochMs + remainingMs,
      remainingMsWhenPaused: null,
    });
  }

  return {
    structure: synced.structure,
    runtime: createInitialTimerRuntime(),
  };
}

export function tickTimer(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSessionState {
  return syncState(input);
}

export function resetTimer(state: TimerSessionState): TimerSessionState {
  return {
    structure: state.structure,
    runtime: createInitialTimerRuntime(),
  };
}

export function goToNextItem(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  const nextIndex = synced.runtime.currentIndex + 1;

  if (nextIndex >= synced.structure.items.length) {
    return synced;
  }

  return moveToItem({
    state: synced,
    cache: input.cache,
    itemIndex: nextIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

export function goToPreviousItem(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSessionState {
  const synced = syncState(input);
  const previousIndex = synced.runtime.currentIndex - 1;

  if (previousIndex < 0) {
    return synced;
  }

  return moveToItem({
    state: synced,
    cache: input.cache,
    itemIndex: previousIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

export function applyEditedStructure(input: {
  state: TimerSessionState;
  currentStructureCache: StructureCache;
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
  const currentDurationMs =
    input.currentStructureCache.itemDurationsMs[currentIndex] ?? 0;

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

export function loadPresetStructure(input: {
  structure: TimerStructure;
}): TimerSessionState {
  const structure = assertTimerStructure(cloneTimerStructure(input.structure));

  return {
    structure,
    runtime: createInitialTimerRuntime(),
  };
}

export function createSnapshot(input: {
  state: TimerSessionState;
  cache: StructureCache;
  nowEpochMs: number;
}): TimerSnapshot {
  const synced = syncState(input);
  const item = currentItem(synced);
  const remainingMs = computeRemainingMs({
    state: synced,
    cache: input.cache,
    nowEpochMs: input.nowEpochMs,
  });
  const nextBreakRemainingMs = computeNextBreakRemainingMs({
    state: synced,
    cache: input.cache,
    nowEpochMs: input.nowEpochMs,
  });

  return {
    title: synced.structure.name,
    status: synced.runtime.status,
    currentItemIndex: synced.runtime.currentIndex,
    currentItemNumber: synced.runtime.currentIndex + 1,
    totalItemCount: synced.structure.items.length,
    currentItemKind: item.kind,
    currentItemLabel: input.cache.itemLabels[synced.runtime.currentIndex] ?? "",
    remainingMs,
    remainingText: formatDurationText(remainingMs),
    showBreakBanner: item.kind === "break",
    showCurrentBlinds: item.kind === "level",
    currentBlindGroups:
      item.kind === "level"
        ? createBlindGroupSnapshot(item.blindGroups)
        : createBlindGroupSnapshot(createDefaultBlindGroups()),
    nextItemText:
      input.cache.nextItemTextByIndex[synced.runtime.currentIndex] ?? "最終項目です",
    nextBreakRemainingMs,
    nextBreakText: formatNextBreakText(nextBreakRemainingMs),
    progressPercent: computeProgressPercent({
      state: synced,
      cache: input.cache,
      remainingMs,
    }),
  };
}
