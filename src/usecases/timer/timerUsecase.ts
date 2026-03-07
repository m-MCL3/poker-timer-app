import { GAME_KIND_ORDER, EMPTY_BLINDS } from "@/domain/entities/blinds";
import {
  createInitialTimerState,
  type TimerState,
  type TimerStatus,
} from "@/domain/entities/timerState";
import type {
  TournamentStructure,
  TournamentStructureItem,
} from "@/domain/entities/tournamentStructure";
import { cloneTournamentStructure } from "@/domain/entities/tournamentStructure";
import {
  createBlindGroupSnapshot,
  type TimerSnapshot,
} from "@/usecases/timer/timerSnapshot";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(state: TimerState): TournamentStructureItem {
  return state.structure.items[state.currentItemIndex] ?? state.structure.items[0];
}

function currentItemDurationMs(state: TimerState): number {
  return currentItem(state)?.durationMs ?? 0;
}

function computeRemainingMs(state: TimerState, nowEpochMs: number): number {
  if (state.status === "running") {
    return clampNonNegative((state.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
  }

  if (state.status === "paused") {
    return clampNonNegative(
      state.pausedRemainingMs ?? currentItemDurationMs(state),
    );
  }

  if (state.status === "idle") {
    return currentItemDurationMs(state);
  }

  return 0;
}

function countLevelsUpToItem(
  structure: TournamentStructure,
  itemIndex: number,
): number {
  let levelCount = 0;

  for (let index = 0; index <= itemIndex; index += 1) {
    if (structure.items[index]?.kind === "level") {
      levelCount += 1;
    }
  }

  return Math.max(levelCount, 1);
}

function findItemIndexByOffset(
  structure: TournamentStructure,
  itemIndex: number,
  offset: -1 | 1,
): number | null {
  const nextIndex = itemIndex + offset;

  if (nextIndex < 0 || nextIndex >= structure.items.length) {
    return null;
  }

  return nextIndex;
}

function buildBlindText(
  item: Extract<TournamentStructureItem, { kind: "level" }>,
): string {
  return GAME_KIND_ORDER.map((gameKind) => {
    const triple = item.blinds[gameKind];
    const sb = triple.sb === null || triple.sb === 0 ? "-" : String(triple.sb);
    const bb = triple.bb === null || triple.bb === 0 ? "-" : String(triple.bb);
    const ante =
      triple.ante === null || triple.ante === 0 ? "-" : String(triple.ante);

    return `${gameKind.toUpperCase()}: ${sb} / ${bb} ( ${ante} )`;
  }).join(" | ");
}

function buildCurrentItemLabel(
  structure: TournamentStructure,
  itemIndex: number,
): string {
  const item = structure.items[itemIndex];

  if (!item) {
    return "";
  }

  if (item.kind === "break") {
    return "BREAK";
  }

  return `LEVEL ${countLevelsUpToItem(structure, itemIndex)}`;
}

function buildNextItemText(
  structure: TournamentStructure,
  itemIndex: number,
): string {
  const nextItem = structure.items[itemIndex + 1];

  if (!nextItem) {
    return "NEXT: （最終項目）";
  }

  if (nextItem.kind === "break") {
    return "NEXT: BREAK";
  }

  const levelNumber = countLevelsUpToItem(structure, itemIndex + 1);
  return `NEXT: LEVEL ${levelNumber} | ${buildBlindText(nextItem)}`;
}

function moveToItem(input: {
  state: TimerState;
  itemIndex: number;
  nowEpochMs: number;
}): TimerState {
  const durationMs = input.state.structure.items[input.itemIndex].durationMs;
  const baseStatus: TimerStatus =
    input.state.status === "finished" ? "idle" : input.state.status;

  if (baseStatus === "running") {
    return {
      ...input.state,
      currentItemIndex: input.itemIndex,
      endsAtEpochMs: input.nowEpochMs + durationMs,
      pausedRemainingMs: null,
    };
  }

  if (baseStatus === "paused") {
    return {
      ...input.state,
      currentItemIndex: input.itemIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: durationMs,
    };
  }

  return {
    ...input.state,
    currentItemIndex: input.itemIndex,
    status: "idle",
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}

function advanceRunningTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  if (input.state.status !== "running") {
    return input.state;
  }

  let nextState = { ...input.state };

  while (nextState.status === "running") {
    const remainingMs = computeRemainingMs(nextState, input.nowEpochMs);

    if (remainingMs > 0) {
      return nextState;
    }

    const nextItemIndex = nextState.currentItemIndex + 1;
    if (nextItemIndex >= nextState.structure.items.length) {
      return {
        ...nextState,
        status: "finished",
        endsAtEpochMs: null,
        pausedRemainingMs: null,
      };
    }

    nextState = {
      ...nextState,
      currentItemIndex: nextItemIndex,
      status: "running",
      endsAtEpochMs:
        (nextState.endsAtEpochMs ?? input.nowEpochMs) +
        nextState.structure.items[nextItemIndex].durationMs,
      pausedRemainingMs: null,
    };
  }

  return nextState;
}

export function syncTimerState(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  return advanceRunningTimer(input);
}

export function startTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);

  return {
    ...syncedState,
    status: "running",
    endsAtEpochMs: input.nowEpochMs + currentItemDurationMs(syncedState),
    pausedRemainingMs: null,
  };
}

export function pauseTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);

  if (syncedState.status !== "running") {
    return syncedState;
  }

  return {
    ...syncedState,
    status: "paused",
    endsAtEpochMs: null,
    pausedRemainingMs: computeRemainingMs(syncedState, input.nowEpochMs),
  };
}

export function resumeTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);
  const remainingMs =
    syncedState.pausedRemainingMs ?? currentItemDurationMs(syncedState);

  return {
    ...syncedState,
    status: "running",
    endsAtEpochMs: input.nowEpochMs + remainingMs,
    pausedRemainingMs: null,
  };
}

export function toggleTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);

  if (syncedState.status === "idle") {
    return startTimer({
      state: syncedState,
      nowEpochMs: input.nowEpochMs,
    });
  }

  if (syncedState.status === "running") {
    return pauseTimer({
      state: syncedState,
      nowEpochMs: input.nowEpochMs,
    });
  }

  if (syncedState.status === "paused") {
    return resumeTimer({
      state: syncedState,
      nowEpochMs: input.nowEpochMs,
    });
  }

  return createInitialTimerState(syncedState.structure);
}

export function tickTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  return syncTimerState(input);
}

export function resetTimer(state: TimerState): TimerState {
  return createInitialTimerState(state.structure);
}

export function goToNextItem(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);
  const nextItemIndex = findItemIndexByOffset(
    syncedState.structure,
    syncedState.currentItemIndex,
    1,
  );

  if (nextItemIndex === null) {
    return syncedState;
  }

  return moveToItem({
    state: syncedState,
    itemIndex: nextItemIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

export function goToPreviousItem(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const syncedState = syncTimerState(input);
  const previousItemIndex = findItemIndexByOffset(
    syncedState.structure,
    syncedState.currentItemIndex,
    -1,
  );

  if (previousItemIndex === null) {
    return syncedState;
  }

  return moveToItem({
    state: syncedState,
    itemIndex: previousItemIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

export function replaceTournamentStructure(input: {
  state: TimerState;
  structure: TournamentStructure;
}): TimerState {
  if (input.state.status === "running") {
    throw new Error("Timer is running. Structure cannot be applied.");
  }

  const structure = cloneTournamentStructure(input.structure);
  const currentItemIndex = Math.min(
    input.state.currentItemIndex,
    structure.items.length - 1,
  );
  const currentDurationMs = structure.items[currentItemIndex].durationMs;

  if (input.state.status === "paused") {
    return {
      structure,
      status: "paused",
      currentItemIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: Math.min(
        input.state.pausedRemainingMs ?? currentDurationMs,
        currentDurationMs,
      ),
    };
  }

  if (input.state.status === "finished") {
    return createInitialTimerState(structure);
  }

  return {
    structure,
    status: input.state.status,
    currentItemIndex,
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}

export function createTimerSnapshot(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerSnapshot {
  const syncedState = syncTimerState(input);
  const item = currentItem(syncedState);
  const currentItemIndex = syncedState.currentItemIndex;

  return {
    title: syncedState.structure.title,
    status: syncedState.status,
    currentItemIndex,
    currentItemNumber: currentItemIndex + 1,
    totalItemCount: syncedState.structure.items.length,
    currentItemOrderText: `ITEM ${currentItemIndex + 1} / ${syncedState.structure.items.length}`,
    currentItemKind: item.kind,
    currentItemLabel: buildCurrentItemLabel(
      syncedState.structure,
      currentItemIndex,
    ),
    remainingMs: computeRemainingMs(syncedState, input.nowEpochMs),
    showBreakBanner: item.kind === "break",
    showCurrentBlinds: item.kind === "level",
    currentBlindGroups:
      item.kind === "level"
        ? createBlindGroupSnapshot(item.blinds)
        : createBlindGroupSnapshot(EMPTY_BLINDS),
    nextItemText: buildNextItemText(
      syncedState.structure,
      currentItemIndex,
    ),
  };
}
