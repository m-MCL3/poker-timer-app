import type { RuntimeStore, RuntimeStoreListener } from "@/application/shared/ports/RuntimeStore";
import type { TimerSession } from "@/domain/timerSession";

export class InMemoryTimerSessionStore implements RuntimeStore {
  private state: TimerSession;
  private readonly listeners = new Set<RuntimeStoreListener>();

  constructor(initialState: TimerSession) {
    this.state = initialState;
  }

  getState(): TimerSession {
    return this.state;
  }

  setState(nextState: TimerSession): void {
    this.state = nextState;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: RuntimeStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
