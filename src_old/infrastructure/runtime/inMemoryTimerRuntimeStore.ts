import type { TimerRuntimeStore, TimerSessionState } from "@/usecases/ports/timerRuntimeStore";

type Listener = () => void;

export class InMemoryTimerRuntimeStore implements TimerRuntimeStore {
  private state: TimerSessionState;

  private readonly listeners = new Set<Listener>();

  constructor(initialState: TimerSessionState) {
    this.state = initialState;
  }

  getState(): TimerSessionState {
    return this.state;
  }

  setState(nextState: TimerSessionState): void {
    this.state = nextState;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
