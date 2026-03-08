import {
  formatBlindValue,
  type BlindGroup,
  type GameKindId,
} from "@/domain/models/blinds";
import type { TimerStatus } from "@/domain/models/timerRuntime";

export type SnapshotBlindGroup = {
  gameKind: GameKindId;
  blinds: {
    sb: string;
    bb: string;
    ante: string;
  };
};

export type TimerSnapshot = {
  title: string;
  status: TimerStatus;
  currentItemIndex: number;
  currentItemNumber: number;
  totalItemCount: number;
  currentItemKind: "level" | "break";
  currentItemLabel: string;
  remainingMs: number;
  remainingText: string;
  showBreakBanner: boolean;
  showCurrentBlinds: boolean;
  currentBlindGroups: SnapshotBlindGroup[];
  nextItemText: string;
  nextBreakRemainingMs: number | null;
  nextBreakText: string;
  progressPercent: number;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDurationText(durationMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, durationMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function formatNextBreakText(nextBreakRemainingMs: number | null): string {
  if (nextBreakRemainingMs === null) {
    return "NO BREAK";
  }

  if (nextBreakRemainingMs === 0) {
    return "NOW";
  }

  return formatDurationText(nextBreakRemainingMs);
}

export function createBlindGroupSnapshot(
  blindGroups: BlindGroup[],
): SnapshotBlindGroup[] {
  return blindGroups.map((group) => ({
    gameKind: group.gameKind,
    blinds: {
      sb: formatBlindValue(group.values.sb),
      bb: formatBlindValue(group.values.bb),
      ante: formatBlindValue(group.values.ante),
    },
  }));
}
