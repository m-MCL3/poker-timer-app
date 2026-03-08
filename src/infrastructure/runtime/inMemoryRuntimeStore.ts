import type {
  RuntimeStore,
  RuntimeStoreListener,
} from "@/application/ports/runtimeStore";
import type { TimerRuntime } from "@/domain/entities/timerRuntime";

export class InMemoryRuntimeStore implements RuntimeStore {
  private state: TimerRuntime;
  private readonly listeners = new Set<RuntimeStoreListener>();

  constructor(initialState: TimerRuntime) {
    this.state = initialState;
  }

  getState(): TimerRuntime {
    return this.state;
  }

  setState(nextState: TimerRuntime): void {
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
