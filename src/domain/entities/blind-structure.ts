export type TimerState = "idle" | "running" | "paused" | "finished";

export type FlBlinds = { sb: number; bb: number; ante: number };
export type StudBlinds = { bringIn: number; complete: number; ante: number };
export type NlplBlinds = { sb: number; bb: number; nlAnte: number };

export type Level = {
  durationSec: number;
  blinds: {
    fl: FlBlinds;
    stud: StudBlinds;
    nlpl: NlplBlinds;
  };
};

export type BlindStructure = {
  levels: Level[];
};

export type TimerSnapshot = {
  state: TimerState;
  structure: BlindStructure;
  currentLevelIndex: number;
  remainingMs: number;
};