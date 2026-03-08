import type { Clock } from "@/application/ports/clock";
import type { RuntimeStore } from "@/application/ports/runtimeStore";
import { createTimerScreenSnapshot, type TimerScreenSnapshot } from "@/application/timer/timerSnapshot";
import { createInitialRuntime, type TimerRuntime, type TimerStatus } from "@/domain/entities/timerRuntime";
import {
  assertStructure,
  cloneStructure,
  itemDurationMs,
  type TimerStructure,
  type TimerStructureItem,
} from "@/domain/entities/timerStructure";

function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

function currentItem(runtime: TimerRuntime): TimerStructureItem {
  return runtime.structure.items[runtime.currentItemIndex] ?? runtime.structure.items[0]!;
}

function remainingMs(runtime: TimerRuntime, nowEpochMs: number): number {
  const item = currentItem(runtime);
  const totalMs = itemDurationMs(item);

  switch (runtime.status) {
    case "running":
      return clampNonNegative((runtime.endsAtEpochMs ?? nowEpochMs) - nowEpochMs);
    case "paused":
      return clampNonNegative(runtime.pausedRemainingMs ?? totalMs);
    case "idle":
      return totalMs;
    case "finished":
      return 0;
  }
}

function withState(runtime: TimerRuntime, patch: Partial<TimerRuntime>): TimerRuntime {
  return {
    ...runtime,
    ...patch,
  };
}

function moveToItem(runtime: TimerRuntime, itemIndex: number, nowEpochMs: number): TimerRuntime {
  const item = runtime.structure.items[itemIndex];
  if (!item) {
    return runtime;
  }

  const durationMs = itemDurationMs(item);
  const baseStatus: TimerStatus = runtime.status === "finished" ? "idle" : runtime.status;

  if (baseStatus === "running") {
    return {
      ...runtime,
      currentItemIndex: itemIndex,
      status: "running",
      endsAtEpochMs: nowEpochMs + durationMs,
      pausedRemainingMs: null,
    };
  }

  if (baseStatus === "paused") {
    return {
      ...runtime,
      currentItemIndex: itemIndex,
      status: "paused",
      endsAtEpochMs: null,
      pausedRemainingMs: durationMs,
    };
  }

  return {
    ...runtime,
    currentItemIndex: itemIndex,
    status: "idle",
    endsAtEpochMs: null,
    pausedRemainingMs: null,
  };
}

function syncRunningRuntime(runtime: TimerRuntime, nowEpochMs: number): TimerRuntime {
  if (runtime.status !== "running") {
    return runtime;
  }

  let nextRuntime = runtime;

  while (nextRuntime.status === "running") {
    const currentRemaining = remainingMs(nextRuntime, nowEpochMs);
    if (currentRemaining > 0) {
      return nextRuntime;
    }

    const nextIndex = nextRuntime.currentItemIndex + 1;
    if (nextIndex >= nextRuntime.structure.items.length) {
      return {
        ...nextRuntime,
        status: "finished",
        endsAtEpochMs: null,
        pausedRemainingMs: null,
      };
    }

    const carryEpochMs = nextRuntime.endsAtEpochMs ?? nowEpochMs;
    const durationMs = itemDurationMs(nextRuntime.structure.items[nextIndex]!);

    nextRuntime = {
      ...nextRuntime,
      currentItemIndex: nextIndex,
      status: "running",
      endsAtEpochMs: carryEpochMs + durationMs,
      pausedRemainingMs: null,
    };
  }

  return nextRuntime;
}

function start(runtime: TimerRuntime, nowEpochMs: number): TimerRuntime {
  const synced = syncRunningRuntime(runtime, nowEpochMs);
  const durationMs = itemDurationMs(currentItem(synced));

  return withState(synced, {
    status: "running",
    endsAtEpochMs: nowEpochMs + durationMs,
    pausedRemainingMs: null,
  });
}

function pause(runtime: TimerRuntime, nowEpochMs: number): TimerRuntime {
  const synced = syncRunningRuntime(runtime, nowEpochMs);
  if (synced.status !== "running") {
    return synced;
  }

  return withState(synced, {
    status: "paused",
    endsAtEpochMs: null,
    pausedRemainingMs: remainingMs(synced, nowEpochMs),
  });
}

function resume(runtime: TimerRuntime, nowEpochMs: number): TimerRuntime {
  const synced = syncRunningRuntime(runtime, nowEpochMs);
  const totalMs = itemDurationMs(currentItem(synced));
  const nextRemainingMs = synced.pausedRemainingMs ?? totalMs;

  return withState(synced, {
    status: "running",
    endsAtEpochMs: nowEpochMs + nextRemainingMs,
    pausedRemainingMs: null,
  });
}

export class TimerSessionService {
  constructor(
    private readonly deps: {
      clock: Clock;
      store: RuntimeStore;
    },
  ) {}

  subscribe(listener: () => void): () => void {
    return this.deps.store.subscribe(listener);
  }

  getRuntime(): TimerRuntime {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    const current = this.deps.store.getState();
    const synced = syncRunningRuntime(current, nowEpochMs);

    if (synced !== current) {
      this.deps.store.setState(synced);
    }

    return synced;
  }

  getSnapshot(): TimerScreenSnapshot {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    const current = this.deps.store.getState();
    const synced = syncRunningRuntime(current, nowEpochMs);

    if (synced !== current) {
      this.deps.store.setState(synced);
    }

    return createTimerScreenSnapshot(synced, nowEpochMs);
  }

  getStructure(): TimerStructure {
    return cloneStructure(this.getRuntime().structure);
  }

  getStatus(): TimerStatus {
    return this.getRuntime().status;
  }

  isEditable(): boolean {
    return this.getStatus() !== "running";
  }

  tick(): void {
    const nowEpochMs = this.deps.clock.nowEpochMs();
    this.deps.store.setState(syncRunningRuntime(this.deps.store.getState(), nowEpochMs));
  }

  toggle(): void {
    const runtime = this.deps.store.getState();
    const nowEpochMs = this.deps.clock.nowEpochMs();

    switch (runtime.status) {
      case "idle":
        this.deps.store.setState(start(runtime, nowEpochMs));
        return;
      case "running":
        this.deps.store.setState(pause(runtime, nowEpochMs));
        return;
      case "paused":
        this.deps.store.setState(resume(runtime, nowEpochMs));
        return;
      case "finished":
        this.deps.store.setState(createInitialRuntime(runtime.structure));
        return;
    }
  }

  goToNextItem(): void {
    const synced = this.getRuntime();
    const nextIndex = synced.currentItemIndex + 1;
    if (nextIndex >= synced.structure.items.length) {
      this.deps.store.setState(synced);
      return;
    }

    this.deps.store.setState(moveToItem(synced, nextIndex, this.deps.clock.nowEpochMs()));
  }

  goToPreviousItem(): void {
    const synced = this.getRuntime();
    const previousIndex = synced.currentItemIndex - 1;
    if (previousIndex < 0) {
      this.deps.store.setState(synced);
      return;
    }

    this.deps.store.setState(moveToItem(synced, previousIndex, this.deps.clock.nowEpochMs()));
  }

  reset(): void {
    this.deps.store.setState(createInitialRuntime(this.deps.store.getState().structure));
  }

  applyStructure(structure: TimerStructure): void {
    const normalized = assertStructure(structure);
    const current = this.deps.store.getState();

    if (current.status === "running") {
      throw new Error("Timer is running. Structure cannot be applied.");
    }

    const currentItemIndex = Math.min(
      current.currentItemIndex,
      normalized.items.length - 1,
    );

    if (current.status === "paused") {
      const currentItem = normalized.items[currentItemIndex]!;
      const maxRemainingMs = itemDurationMs(currentItem);

      this.deps.store.setState({
        structure: normalized,
        status: "paused",
        currentItemIndex,
        endsAtEpochMs: null,
        pausedRemainingMs: Math.min(
          current.pausedRemainingMs ?? maxRemainingMs,
          maxRemainingMs,
        ),
      });
      return;
    }

    if (current.status === "finished") {
      this.deps.store.setState(createInitialRuntime(normalized));
      return;
    }

    this.deps.store.setState({
      structure: normalized,
      status: current.status,
      currentItemIndex,
      endsAtEpochMs: null,
      pausedRemainingMs: null,
    });
  }

  loadPresetStructure(structure: TimerStructure): void {
    this.deps.store.setState(createInitialRuntime(assertStructure(structure)));
  }
}
