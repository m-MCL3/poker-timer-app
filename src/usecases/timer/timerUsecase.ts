import { GAME_KIND_ORDER } from "@/domain/entities/blinds";
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
import { snapshotKinds, type TimerSnapshot } from "@/usecases/timer/timerSnapshot";

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

  for (let i = 0; i <= itemIndex; i += 1) {
    if (structure.items[i]?.kind === "level") {
      levelCount += 1;
    }
  }

  return Math.max(levelCount, 1);
}

function findItemByOffset(
  structure: TournamentStructure,
  itemIndex: number,
  offset: -1 | 1,
): TournamentStructureItem | null {
  return structure.items[itemIndex + offset] ?? null;
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

function buildBlindsText(
  item: Extract<TournamentStructureItem, { kind: "level" }>,
): string {
  return GAME_KIND_ORDER.map((kind) => {
    const triple = item.blinds[kind];
    const sb = triple.sb === null || triple.sb === 0 ? "-" : String(triple.sb);
    const bb = triple.bb === null || triple.bb === 0 ? "-" : String(triple.bb);
    const ante =
      triple.ante === null || triple.ante === 0 ? "-" : String(triple.ante);
    return `${kind.toUpperCase()}: ${sb} / ${bb} ( ${ante} )`;
  }).join(" | ");
}

function buildItemLabel(
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
  const nextItem = findItemByOffset(structure, itemIndex, 1);

  if (!nextItem) {
    return "NEXT: （最終項目）";
  }

  if (nextItem.kind === "break") {
    return "NEXT: BREAK";
  }

  return `NEXT: ${buildBlindsText(nextItem)}`;
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

export function toggleTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  if (input.state.status === "idle") {
    return {
      ...input.state,
      status: "running",
      endsAtEpochMs: input.nowEpochMs + currentItemDurationMs(input.state),
      pausedRemainingMs: null,
    };
  }

  if (input.state.status === "running") {
    return {
      ...input.state,
      status: "paused",
      endsAtEpochMs: null,
      pausedRemainingMs: computeRemainingMs(input.state, input.nowEpochMs),
    };
  }

  if (input.state.status === "paused") {
    const remainingMs =
      input.state.pausedRemainingMs ?? currentItemDurationMs(input.state);

    return {
      ...input.state,
      status: "running",
      endsAtEpochMs: input.nowEpochMs + remainingMs,
      pausedRemainingMs: null,
    };
  }

  return createInitialTimerState(input.state.structure);
}

export function tickTimer(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  if (input.state.status !== "running") {
    return input.state;
  }

  const remainingMs = computeRemainingMs(input.state, input.nowEpochMs);
  if (remainingMs > 0) {
    return input.state;
  }

  const nextItemIndex = input.state.currentItemIndex + 1;
  if (nextItemIndex >= input.state.structure.items.length) {
    return {
      ...input.state,
      status: "finished",
      endsAtEpochMs: null,
      pausedRemainingMs: null,
    };
  }

  return {
    ...input.state,
    currentItemIndex: nextItemIndex,
    status: "running",
    endsAtEpochMs:
      input.nowEpochMs + input.state.structure.items[nextItemIndex].durationMs,
    pausedRemainingMs: null,
  };
}

export function resetTimer(state: TimerState): TimerState {
  return createInitialTimerState(state.structure);
}

export function goToNextItem(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const nextItemIndex = findItemIndexByOffset(
    input.state.structure,
    input.state.currentItemIndex,
    1,
  );

  if (nextItemIndex === null) {
    return input.state;
  }

  return moveToItem({
    state: input.state,
    itemIndex: nextItemIndex,
    nowEpochMs: input.nowEpochMs,
  });
}

export function goToPreviousItem(input: {
  state: TimerState;
  nowEpochMs: number;
}): TimerState {
  const previousItemIndex = findItemIndexByOffset(
    input.state.structure,
    input.state.currentItemIndex,
    -1,
  );

  if (previousItemIndex === null) {
    return input.state;
  }

  return moveToItem({
    state: input.state,
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
  const item = currentItem(input.state);
  const currentItemIndex = input.state.currentItemIndex;

  return {
    title: input.state.structure.title,
    status: input.state.status,
    currentItemIndex,
    totalItemCount: input.state.structure.items.length,
    currentItemOrderText: `ITEM ${currentItemIndex + 1} / ${input.state.structure.items.length}`,
    currentItemKind: item.kind,
    currentItemLabel: buildItemLabel(input.state.structure, currentItemIndex),
    remainingMs: computeRemainingMs(input.state, input.nowEpochMs),
    currentDisplayBlinds:
      item.kind === "level" ? snapshotKinds(item.blinds) : [],
    nextItemText: buildNextItemText(
      input.state.structure,
      currentItemIndex,
    ),
  };
}
