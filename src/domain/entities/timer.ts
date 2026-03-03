import { Level } from "./level";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerDefinition = {
  id: string;
  title: string;
  levels: Level[];
};

export type TimerRuntime = {
  status: TimerStatus;
  levelIndex: number;

  /**
   * running中の基準（実時間整合）
   * remainingMs を毎tickで減らす方式だと、タブ停止/間引きでズレるので、
   * running中は endsAtEpochMs を正とする。
   */
  endsAtEpochMs: number | null;

  /**
   * paused中の正（再開用）
   */
  remainingMs: number | null;
};

export const createInitialRuntime = (): TimerRuntime => ({
  status: "idle",
  levelIndex: 0,
  endsAtEpochMs: null,
  remainingMs: null,
});