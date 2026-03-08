import { EditorService } from "@/application/editor/editorService";
import { PresetService } from "@/application/presets/presetService";
import { TimerController } from "@/application/timer/timerController";
import { TimerSessionService } from "@/application/timer/timerSessionService";
import { createInitialRuntime } from "@/domain/entities/timerRuntime";
import { defaultTimerStructure } from "@/infrastructure/mock/defaultTimerStructure";
import { LocalTimerPresetRepository } from "@/infrastructure/persistence/localTimerPresetRepository";
import { InMemoryRuntimeStore } from "@/infrastructure/runtime/inMemoryRuntimeStore";
import { BrowserIntervalScheduler } from "@/infrastructure/scheduler/browserIntervalScheduler";
import { BrowserKeyValueStore } from "@/infrastructure/storage/browserKeyValueStore";
import { SystemClock } from "@/infrastructure/clock/systemClock";

export type AppContainer = {
  timerSessionService: TimerSessionService;
  timerController: TimerController;
  editorService: EditorService;
  presetService: PresetService;
};

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  const scheduler = new BrowserIntervalScheduler();
  const runtimeStore = new InMemoryRuntimeStore(
    createInitialRuntime(defaultTimerStructure),
  );
  const timerSessionService = new TimerSessionService({
    clock,
    store: runtimeStore,
  });
  const timerController = new TimerController(timerSessionService, scheduler);
  const editorService = new EditorService();
  const presetService = new PresetService(
    new LocalTimerPresetRepository(new BrowserKeyValueStore()),
  );

  return {
    timerSessionService,
    timerController,
    editorService,
    presetService,
  };
}
