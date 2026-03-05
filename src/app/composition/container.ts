import { SystemClock } from "@/adapters/clock/systemClock";
import { sampleTimerDefinition } from "@/adapters/mock/sampleTimerDefinition";
import { LocalStorageStorage } from "@/adapters/storage/localStorageStorage";

import { TimerUsecase } from "@/usecases/timer/timerUsecase";
import type { StoragePort } from "@/usecases/ports/storage";

export type AppContainer = {
  timerUsecase: TimerUsecase;
  storage: StoragePort;
};

export function createContainer(): AppContainer {
  const clock = new SystemClock();

  // ここは将来: 起動時に保存済み構成を読み込んで def を差し替える余地あり
  const timerUsecase = new TimerUsecase(sampleTimerDefinition, clock);

  const storage: StoragePort = new LocalStorageStorage();

  return {
    timerUsecase,
    storage,
  };
}