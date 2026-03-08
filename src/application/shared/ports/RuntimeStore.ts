import type { TimerSession } from "@/domain/timerSession";

export type RuntimeStoreListener = () => void;

export interface RuntimeStore {
  getState(): TimerSession;
  setState(nextState: TimerSession): void;
  subscribe(listener: RuntimeStoreListener): () => void;
}
