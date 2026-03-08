import type { TimerRuntime } from "@/domain/models/timerRuntime";
import type { TimerStructure } from "@/domain/models/timerStructure";

export type TimerSessionState = {
  structure: TimerStructure;
  runtime: TimerRuntime;
};

export interface TimerRuntimeStore {
  getState(): TimerSessionState;
  setState(nextState: TimerSessionState): void;
  subscribe(listener: () => void): () => void;
}
