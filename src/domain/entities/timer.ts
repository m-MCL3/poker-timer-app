import type { BlindsByGame } from "@/domain/entities/blinds";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type LevelEntry = {
  id: string;
  kind: "level";
  durationMs: number;
  blinds: BlindsByGame;
};

export type BreakEntry = {
  id: string;
  kind: "break";
  durationMs: number;
};

export type TimerEntry = LevelEntry | BreakEntry;

export type TimerDefinition = {
  id: string;
  title: string;

  /**
   * Level と Break を混在させたタイムライン（順序が本体）
   */
  entries: TimerEntry[];

  /**
   * 共通なのは「時間」なので、デフォルトは時間だけ持つ
   */
  defaultLevelDurationMs: number;
  defaultBreakDurationMs: number;
};

export type TimerRuntime = {
  status: TimerStatus;

  /**
   * 現在位置（entriesのindex）
   */
  entryIndex: number;

  endsAtEpochMs: number | null;
  remainingMs: number | null;
};

export const createInitialRuntime = (): TimerRuntime => ({
  status: "idle",
  entryIndex: 0,
  endsAtEpochMs: null,
  remainingMs: null,
});