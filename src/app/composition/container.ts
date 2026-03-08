import { SystemClock } from "@/adapters/clock/systemClock";
import { defaultTimerStructure } from "@/adapters/mock/defaultTimerStructure";
import { LocalStorageStorage } from "@/adapters/storage/localStorageStorage";
import { createInitialTimerState } from "@/domain/entities/timerState";
import { LocalStructurePresetRepository } from "@/infrastructure/persistence/structurePresetRepository";
import { EditorUsecase } from "@/usecases/editor/editorUsecase";
import { PresetUsecase } from "@/usecases/preset/presetUsecase";
import type {
  RuntimeStore,
  RuntimeStoreListener,
} from "@/usecases/ports/runtimeStore";
import { TimerController } from "@/usecases/timer/timerController";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";

function createRuntimeStore(initialState = createInitialTimerState(defaultTimerStructure)): RuntimeStore {
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
  const runtimeStore = createRuntimeStore();
  const timerUsecase = new TimerUsecase({
    clock,
    store: runtimeStore,
  });
  const timerController = new TimerController(timerUsecase);
  const editorUsecase = new EditorUsecase();
  const presetUsecase = new PresetUsecase(
    new LocalStructurePresetRepository(new LocalStorageStorage()),
  );

  return {
    timerUsecase,
    timerController,
    editorUsecase,
    presetUsecase,
  };
}
