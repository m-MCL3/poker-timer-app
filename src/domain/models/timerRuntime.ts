export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerRuntime = {
  status: TimerStatus;
  currentIndex: number;
  startedAtEpochMs: number | null;
  endsAtEpochMs: number | null;
  remainingMsWhenPaused: number | null;
};

export function createInitialTimerRuntime(): TimerRuntime {
  return {
    status: "idle",
    currentIndex: 0,
    startedAtEpochMs: null,
    endsAtEpochMs: null,
    remainingMsWhenPaused: null,
  };
}
