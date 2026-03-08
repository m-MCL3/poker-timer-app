import type { TimerRuntime } from "@/domain/models/timerRuntime";
import type { TimerStructure } from "@/domain/models/timerStructure";

export type TimerSessionState = {
  structure: TimerStructure;
  runtime: TimerRuntime;
};

export type RuntimeStoreListener = () => void;

export type TimerRuntimeStore = {
  getState: () => TimerSessionState;
  setState: (nextState: TimerSessionState) => void;
  subscribe: (listener: RuntimeStoreListener) => () => void;
};
