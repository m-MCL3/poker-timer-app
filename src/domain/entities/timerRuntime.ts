import { cloneStructure, type TimerStructure } from "@/domain/entities/timerStructure";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerRuntime = {
  structure: TimerStructure;
  currentItemIndex: number;
  status: TimerStatus;
  endsAtEpochMs: number | null;
  pausedRemainingMs: number | null;
};

export function createInitialRuntime(structure: TimerStructure): TimerRuntime {
  return {
    structure: cloneStructure(structure),
    currentItemIndex: 0,
    status: "idle",
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}
