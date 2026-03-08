import type { TimerState } from "@/domain/entities/timerState";

export type RuntimeStoreListener = () => void;

export interface RuntimeStore {
  getState(): TimerState;
  setState(nextState: TimerState): void;
  subscribe(listener: RuntimeStoreListener): () => void;
}
