import { BrowserIntervalScheduler } from "@/adapters/clock/browserIntervalScheduler";
import { SystemClock } from "@/adapters/clock/systemClock";
import { defaultTimerStructure } from "@/adapters/mock/defaultTimerStructure";
import { LocalStorageStorage } from "@/adapters/storage/localStorageStorage";
import { createInitialTimerRuntime } from "@/domain/models/timerRuntime";
import { TimerPresetRepository } from "@/infrastructure/persistence/timerPresetRepository";
import { EditorUsecase } from "@/usecases/editor/editorUsecase";
import { PresetUsecase } from "@/usecases/preset/presetUsecase";
import type {
  RuntimeStoreListener,
  TimerRuntimeStore,
  TimerSessionState,
} from "@/usecases/ports/runtimeStore";
import { TimerController } from "@/usecases/timer/timerController";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";

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
  timerController: TimerController;
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
    store: runtimeStore,
  });

  const timerController = new TimerController({
    scheduler,
    timerUsecase,
    tickIntervalMs: 250,
  });

  const editorUsecase = new EditorUsecase();
  const presetUsecase = new PresetUsecase(presetRepository);

  return {
    timerUsecase,
    timerController,
    editorUsecase,
    presetUsecase,
  };
}
