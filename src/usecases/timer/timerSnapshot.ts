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
  levelIndex: number;
  levelCount: number;
  remainingMs: number;
  currentItemKind: "level" | "break";
  currentItemText: string;
  currentBlinds: SnapshotKind[];
  nextLevelText: string;
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
