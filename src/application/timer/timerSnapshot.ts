import {
  GAME_KIND_ORDER,
  blindSlotLabels,
  formatBlindValue,
  gameKindLabel,
} from "@/domain/entities/blinds";
import type { TimerRuntime, TimerStatus } from "@/domain/entities/timerRuntime";
import {
  buildItemLabel,
  itemDurationMs,
  type LevelItem,
  type TimerStructureItem,
} from "@/domain/entities/timerStructure";

export type BlindGroupSnapshot = {
  gameKind: string;
  slots: Array<{ label: string; value: string }>;
};

export type TimerScreenSnapshot = {
  title: string;
  status: TimerStatus;
  currentItemIndex: number;
  currentItemLabel: string;
  currentItemKind: "level" | "break";
  currentItemDurationText: string;
  remainingMs: number;
  remainingText: string;
  progressPercent: number;
  showBreakBanner: boolean;
  currentBlindGroups: BlindGroupSnapshot[];
  nextItemText: string;
  nextBreakText: string;
  primaryActionLabel: string;
};

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(runtime: TimerRuntime): TimerStructureItem {
  return runtime.structure.items[runtime.currentItemIndex] ?? runtime.structure.items[0]!;
}

function remainingMs(runtime: TimerRuntime, nowEpochMs: number): number {
  const item = currentItem(runtime);
  const totalMs = itemDurationMs(item);

  switch (runtime.status) {
    case "running":
      return clampNonNegative((runtime.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
    case "paused":
      return clampNonNegative(runtime.pausedRemainingMs ?? totalMs);
    case "idle":
      return totalMs;
    case "finished":
      return 0;
  }
}

export function formatDurationText(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function createBlindGroups(item: LevelItem): BlindGroupSnapshot[] {
  return GAME_KIND_ORDER.map((gameKind) => {
    const labels = blindSlotLabels(gameKind);
    const values = item.blinds[gameKind];

    return {
      gameKind: gameKindLabel(gameKind),
      slots: [
        { label: labels.sb, value: formatBlindValue(values.sb) },
        { label: labels.bb, value: formatBlindValue(values.bb) },
        { label: labels.ante, value: formatBlindValue(values.ante) },
      ],
    };
  });
}

function nextItemText(runtime: TimerRuntime): string {
  const nextIndex = runtime.currentItemIndex + 1;
  const nextItem = runtime.structure.items[nextIndex];

  if (!nextItem) {
    return "次の項目はありません";
  }

  return buildItemLabel(runtime.structure, nextIndex);
}

function nextBreakRemainingMs(runtime: TimerRuntime, nowEpochMs: number): number | null {
  const activeItem = currentItem(runtime);

  if (activeItem.kind === "break") {
    return 0;
  }

  let totalMs = remainingMs(runtime, nowEpochMs);

  for (let index = runtime.currentItemIndex + 1; index < runtime.structure.items.length; index += 1) {
    const item = runtime.structure.items[index]!;
    if (item.kind === "break") {
      return totalMs;
    }
    totalMs += itemDurationMs(item);
  }

  return null;
}

function formatNextBreakText(durationMs: number | null): string {
  if (durationMs === null) {
    return "休憩は設定されていません";
  }
  if (durationMs === 0) {
    return "休憩中";
  }

  return `${formatDurationText(durationMs)} 後`;
}

function primaryActionLabel(status: TimerStatus): string {
  switch (status) {
    case "idle":
      return "Start";
    case "running":
      return "Pause";
    case "paused":
      return "Resume";
    case "finished":
      return "Reset";
  }
}

export function createTimerScreenSnapshot(
  runtime: TimerRuntime,
  nowEpochMs: number,
): TimerScreenSnapshot {
  const item = currentItem(runtime);
  const currentRemainingMs = remainingMs(runtime, nowEpochMs);
  const totalMs = itemDurationMs(item);
  const progressPercent =
    totalMs <= 0 ? 0 : ((totalMs - currentRemainingMs) / totalMs) * 100;

  return {
    title: runtime.structure.name,
    status: runtime.status,
    currentItemIndex: runtime.currentItemIndex,
    currentItemLabel: buildItemLabel(runtime.structure, runtime.currentItemIndex),
    currentItemKind: item.kind,
    currentItemDurationText: `${item.durationMinutes} min`,
    remainingMs: currentRemainingMs,
    remainingText: formatDurationText(currentRemainingMs),
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    showBreakBanner: item.kind === "break",
    currentBlindGroups: item.kind === "level" ? createBlindGroups(item) : [],
    nextItemText: nextItemText(runtime),
    nextBreakText: formatNextBreakText(nextBreakRemainingMs(runtime, nowEpochMs)),
    primaryActionLabel: primaryActionLabel(runtime.status),
  };
}
