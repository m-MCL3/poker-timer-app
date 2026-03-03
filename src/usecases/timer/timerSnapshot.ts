import { TimerStatus } from "@/domain/entities/timer";
import { BlindsByGame, GameKindId } from "@/domain/entities/blinds";

export type BlindLabels = {
  left: string;
  mid: string;
  right: string;
};

export type SnapshotKind = {
  kind: GameKindId;
  labels: BlindLabels;
  blinds: { sb: string; bb: string; ante: string }; // UI用に整形済み
};

export type TimerSnapshot = {
  title: string;
  status: TimerStatus;

  levelIndex: number;
  levelCount: number;

  remainingMs: number; // 0以上
  currentBlinds: SnapshotKind[];
  nextLevelText: string; // v1.0: 文字列でOK
};