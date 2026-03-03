import { SystemClock } from "@/adapters/clock/systemClock";
import { sampleTimerDefinition } from "@/adapters/mock/sampleTimerDefinition";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";
import { NoopStorage } from "@/adapters/storage/noopStorage";
import { ConsoleNotify } from "@/adapters/notifications/consoleNotify";

export type AppContainer = {
  timerUsecase: TimerUsecase;

  // 空箱（将来差し替え）
  storage: NoopStorage;
  notify: ConsoleNotify;
};

export const createContainer = (): AppContainer => {
  const clock = new SystemClock();
  const timerUsecase = new TimerUsecase(sampleTimerDefinition, clock);

  return {
    timerUsecase,
    storage: new NoopStorage(),
    notify: new ConsoleNotify(),
  };
};