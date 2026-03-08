import { BrowserIntervalScheduler } from "@/adapters/clock/browserIntervalScheduler";
import { SystemClock } from "@/adapters/clock/systemClock";
import { defaultTimerStructure } from "@/adapters/mock/defaultTimerStructure";
import { LocalStorageStorage } from "@/adapters/storage/localStorageStorage";
import { EditorUsecase } from "@/usecases/editor/editorUsecase";
import { PresetUsecase } from "@/usecases/preset/presetUsecase";
import { createInitialTimerRuntime } from "@/domain/models/timerRuntime";
import type {
  RuntimeStoreListener,
  TimerRuntimeStore,
  TimerSessionState,
} from "@/usecases/ports/runtimeStore";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";
import { TimerPresetRepository } from "@/infrastructure/persistence/timerPresetRepository";

function createRuntimeStore(initialState: TimerSessionState): TimerRuntimeStore {
  let state = initialState;
  const listeners = new Set<RuntimeStoreListener>();

  return {
    getState: () => state,
    setState: (nextState) => {
      state = nextState;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type AppContainer = {
  timerUsecase: TimerUsecase;
  editorUsecase: EditorUsecase;
  presetUsecase: PresetUsecase;
};

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  const scheduler = new BrowserIntervalScheduler();
  const storage = new LocalStorageStorage();
  const presetRepository = new TimerPresetRepository(storage);

  const runtimeStore = createRuntimeStore({
    structure: defaultTimerStructure,
    runtime: createInitialTimerRuntime(),
  });

  const timerUsecase = new TimerUsecase({
    clock,
    scheduler,
    store: runtimeStore,
  });

  const editorUsecase = new EditorUsecase();
  const presetUsecase = new PresetUsecase(presetRepository);

  return {
    timerUsecase,
    editorUsecase,
    presetUsecase,
  };
}
