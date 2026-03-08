import { cloneStructure, type TournamentStructure } from "@/domain/tournamentStructure";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerSession = {
  structure: TournamentStructure;
  status: TimerStatus;
  currentItemIndex: number;
  endsAtEpochMs: number | null;
  pausedRemainingMs: number | null;
};

export function createInitialTimerSession(structure: TournamentStructure): TimerSession {
  return {
    structure: cloneStructure(structure),
    status: "idle",
    currentItemIndex: 0,
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}
