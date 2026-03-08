import type { Clock } from "@/usecases/ports/clock";
import type {
  TimerRuntimeStore,
  TimerSessionState,
} from "@/usecases/ports/runtimeStore";
import { compileStructure } from "@/usecases/timer/compileStructure";
import type { StructureCache } from "@/usecases/timer/structureCache";
import type { TimerSnapshot } from "@/usecases/timer/timerSnapshot";
import type { TimerStatus } from "@/domain/models/timerRuntime";
import {
  assertTimerStructure,
  cloneTimerStructure,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import {
  applyEditedStructure as applyEditedStructureByEngine,
  createSnapshot as createSnapshotByEngine,
  goToNextItem as goToNextItemByEngine,
  goToPreviousItem as goToPreviousItemByEngine,
  loadPresetStructure as loadPresetStructureByEngine,
  resetTimer as resetTimerByEngine,
  tickTimer as tickTimerByEngine,
  toggleTimer as toggleTimerByEngine,
} from "@/usecases/timer/timerEngine";

export class TimerUsecase {
  private compiled:
    | {
        structureRef: TimerStructure;
        cache: StructureCache;
      }
    | null = null;

  constructor(
    private readonly deps: {
      clock: Clock;
      store: TimerRuntimeStore;
    },
  ) {}

  private getCache(structure: TimerStructure): StructureCache {
    if (this.compiled?.structureRef === structure) {
      return this.compiled.cache;
    }

    const cache = compileStructure(structure);
    this.compiled = {
      structureRef: structure,
      cache,
    };
    return cache;
  }

  private getState(): TimerSessionState {
    return this.deps.store.getState();
  }

  subscribe(listener: () => void): () => void {
    return this.deps.store.subscribe(listener);
  }

  getSnapshot(): TimerSnapshot {
    const state = this.getState();
    return createSnapshotByEngine({
      state,
      cache: this.getCache(state.structure),
      nowEpochMs: this.deps.clock.nowEpochMs(),
    });
  }

  getStructure(): TimerStructure {
    return cloneTimerStructure(this.getState().structure);
  }

  getStatus(): TimerStatus {
    return this.getState().runtime.status;
  }

  isEditable(): boolean {
    return this.getStatus() !== "running";
  }

  tick(): void {
    const state = this.getState();
    this.deps.store.setState(
      tickTimerByEngine({
        state,
        cache: this.getCache(state.structure),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  toggle(): void {
    const state = this.getState();
    this.deps.store.setState(
      toggleTimerByEngine({
        state,
        cache: this.getCache(state.structure),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  goToNextItem(): void {
    const state = this.getState();
    this.deps.store.setState(
      goToNextItemByEngine({
        state,
        cache: this.getCache(state.structure),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  goToPreviousItem(): void {
    const state = this.getState();
    this.deps.store.setState(
      goToPreviousItemByEngine({
        state,
        cache: this.getCache(state.structure),
        nowEpochMs: this.deps.clock.nowEpochMs(),
      }),
    );
  }

  reset(): void {
    this.deps.store.setState(resetTimerByEngine(this.getState()));
  }

  loadStructure(structure: TimerStructure): void {
    this.applyEditedStructure(structure);
  }

  applyEditedStructure(structure: TimerStructure): void {
    const nextStructure = assertTimerStructure(cloneTimerStructure(structure));
    this.deps.store.setState(
      applyEditedStructureByEngine({
        state: this.getState(),
        currentStructureCache: this.getCache(this.getState().structure),
        structure: nextStructure,
      }),
    );
  }

  loadPresetStructure(structure: TimerStructure): void {
    this.deps.store.setState(loadPresetStructureByEngine({ structure }));
  }
}
