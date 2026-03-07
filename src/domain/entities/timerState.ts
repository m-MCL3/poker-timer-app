import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerState = {
  structure: TournamentStructure;
  status: TimerStatus;
  currentItemIndex: number;
  endsAtEpochMs: number | null;
  pausedRemainingMs: number | null;
};

export function createInitialTimerState(
  structure: TournamentStructure,
): TimerState {
  return {
    structure,
    status: "idle",
    currentItemIndex: 0,
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}
