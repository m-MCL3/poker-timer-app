import { formatBlindValue, type BlindsByGame, type GameKindId } from "@/domain/entities/blinds";
import type { TimerStatus } from "@/domain/entities/timerState";

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

export function createBlindGroupSnapshot(blinds: BlindsByGame): SnapshotBlindGroup[] {
  return (["fl", "stud", "nlpl"] as const).map((gameKind) => ({
    gameKind,
    blinds: {
      sb: formatBlindValue(blinds[gameKind].sb),
      bb: formatBlindValue(blinds[gameKind].bb),
      ante: formatBlindValue(blinds[gameKind].ante),
    },
  }));
}
