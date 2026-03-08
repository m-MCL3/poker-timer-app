import { formatBlindValue, type GameKindId } from "@/domain/blinds";
import type { TimerStatus } from "@/domain/timerSession";

export type TimerBlindGroupView = {
  gameKind: GameKindId;
  blinds: {
    sb: string;
    bb: string;
    ante: string;
  };
};

export type TimerView = {
  title: string;
  status: TimerStatus;
  currentItemIndex: number;
  currentItemNumber: number;
  totalItemCount: number;
  currentItemKind: "level" | "break";
  currentItemLabel: string;
  remainingMs: number;
  remainingText: string;
  progressPercent: number;
  showBreakBanner: boolean;
  currentBlindGroups: TimerBlindGroupView[];
  nextItemText: string;
  nextBreakText: string;
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
  if (nextBreakRemainingMs <= 0) {
    return "NOW";
  }
  return formatDurationText(nextBreakRemainingMs);
}

export function createBlindGroupView(input: {
  gameKind: GameKindId;
  sb: number | null;
  bb: number | null;
  ante: number | null;
}[]): TimerBlindGroupView[] {
  return input.map((group) => ({
    gameKind: group.gameKind,
    blinds: {
      sb: formatBlindValue(group.sb),
      bb: formatBlindValue(group.bb),
      ante: formatBlindValue(group.ante),
    },
  }));
}
