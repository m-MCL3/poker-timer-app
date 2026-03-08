import type { TimerRuntime } from "@/domain/entities/timerRuntime";

export type RuntimeStoreListener = () => void;

export interface RuntimeStore {
  getState(): TimerRuntime;
  setState(nextState: TimerRuntime): void;
  subscribe(listener: RuntimeStoreListener): () => void;
}
