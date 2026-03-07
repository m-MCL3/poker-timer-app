import {
  formatBlindValue,
  labelsFor,
  type BlindLabels,
  type BlindsByGame,
  type GameKindId,
} from "@/domain/entities/blinds";
import type { TimerStatus } from "@/domain/entities/timerState";

export type SnapshotKind = {
  kind: GameKindId;
  labels: BlindLabels;
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
  totalItemCount: number;
  currentItemOrderText: string;
  currentItemKind: "level" | "break";
  currentItemLabel: string;
  remainingMs: number;
  currentDisplayBlinds: SnapshotKind[];
  nextItemText: string;
};

export function snapshotKinds(blinds: BlindsByGame): SnapshotKind[] {
  return (["fl", "stud", "nlpl"] as const).map((kind) => ({
    kind,
    labels: labelsFor(kind),
    blinds: {
      sb: formatBlindValue(blinds[kind].sb),
      bb: formatBlindValue(blinds[kind].bb),
      ante: formatBlindValue(blinds[kind].ante),
    },
  }));
}
