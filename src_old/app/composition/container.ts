import { SystemClock } from "@/adapters/clock/systemClock";
import { RandomIdGenerator } from "@/adapters/ids/randomIdGenerator";
import { sampleTimerStructure } from "@/adapters/mock/sampleTimerStructure";
import { BrowserIntervalScheduler } from "@/adapters/scheduler/browserIntervalScheduler";
import { LocalStorageKeyValueStore } from "@/adapters/storage/localStorageKeyValueStore";
import { createInitialTimerRuntime } from "@/domain/models/timerRuntime";
import { cloneTimerStructure } from "@/domain/models/timerStructure";
import { TimerStructureRepository } from "@/infrastructure/persistence/timerStructureRepository";
import { InMemoryTimerRuntimeStore } from "@/infrastructure/runtime/inMemoryTimerRuntimeStore";
import { EditorUsecase } from "@/usecases/editor/editorUsecase";
import { PresetUsecase } from "@/usecases/preset/presetUsecase";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";

export type AppContainer = {
  timerUsecase: TimerUsecase;
  editorUsecase: EditorUsecase;
  presetUsecase: PresetUsecase;
};

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  const idGenerator = new RandomIdGenerator();
  const scheduler = new BrowserIntervalScheduler();
  const keyValueStore = new LocalStorageKeyValueStore();
  const repository = new TimerStructureRepository(keyValueStore, () => clock.nowEpochMs());
  const runtimeStore = new InMemoryTimerRuntimeStore({
    structure: cloneTimerStructure(sampleTimerStructure),
    runtime: createInitialTimerRuntime(),
  });

  const timerUsecase = new TimerUsecase({
    clock,
    store: runtimeStore,
    scheduler,
  });

  const editorUsecase = new EditorUsecase(
    {
      structure: timerUsecase.getStructure(),
      isEditable: timerUsecase.getStatus() !== "running",
    },
    idGenerator,
  );

  timerUsecase.subscribe(() => {
    editorUsecase.syncEditable(timerUsecase.getStatus() !== "running");
  });

  const presetUsecase = new PresetUsecase(repository);

  return {
    timerUsecase,
    editorUsecase,
    presetUsecase,
  };
}
