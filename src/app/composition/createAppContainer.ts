import { EditorService } from "@/application/editor/EditorService";
import { PresetService } from "@/application/preset/PresetService";
import { TimerHeartbeat } from "@/application/timer/TimerHeartbeat";
import { TimerService } from "@/application/timer/TimerService";
import { createInitialTimerSession } from "@/domain/timerSession";
import { SystemClock } from "@/infrastructure/clock/SystemClock";
import { createDefaultStructure } from "@/infrastructure/mock/createDefaultStructure";
import { LocalStorageStructurePresetRepository } from "@/infrastructure/preset/LocalStorageStructurePresetRepository";
import { InMemoryTimerSessionStore } from "@/infrastructure/runtime/InMemoryTimerSessionStore";
import { BrowserIntervalScheduler } from "@/infrastructure/scheduler/BrowserIntervalScheduler";
import { BrowserKeyValueStorage } from "@/infrastructure/storage/BrowserKeyValueStorage";

export type AppContainer = {
  timerService: TimerService;
  timerHeartbeat: TimerHeartbeat;
  editorService: EditorService;
  presetService: PresetService;
};

export function createAppContainer(): AppContainer {
  const clock = new SystemClock();
  const scheduler = new BrowserIntervalScheduler();
  const storage = new BrowserKeyValueStorage();
  const presetRepository = new LocalStorageStructurePresetRepository(storage);
  const runtimeStore = new InMemoryTimerSessionStore(
    createInitialTimerSession(createDefaultStructure()),
  );

  const timerService = new TimerService({
    clock,
    store: runtimeStore,
  });

  const timerHeartbeat = new TimerHeartbeat({
    scheduler,
    timerService,
    intervalMs: 250,
  });

  return {
    timerService,
    timerHeartbeat,
    editorService: new EditorService(),
    presetService: new PresetService(presetRepository),
  };
}
