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
  showBreakBanner: boolean;
  showCurrentBlinds: boolean;
  currentBlindGroups: SnapshotBlindGroup[];
  nextItemText: string;
  nextBreakRemainingMs: number | null;
};

export function createBlindGroupSnapshot(blindGroups: BlindGroup[]): SnapshotBlindGroup[] {
  return blindGroups.map((group) => ({
    gameKind: group.gameKind,
    blinds: {
      sb: formatBlindValue(group.values.sb),
      bb: formatBlindValue(group.values.bb),
      ante: formatBlindValue(group.values.ante),
    },
  }));
}
