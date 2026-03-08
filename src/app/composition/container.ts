import { SystemClock } from "@/adapters/clock/systemClock";
import { sampleTournamentStructure } from "@/adapters/mock/sampleTournamentStructure";
import { LocalStorageStorage } from "@/adapters/storage/localStorageStorage";
import {
  createInitialTimerState,
  type TimerState,
} from "@/domain/entities/timerState";
import { TournamentStructureStorage } from "@/infrastructure/persistence/tournamentStructureStorage";
import type { StoragePort } from "@/usecases/ports/storage";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";

type TimerStoreListener = () => void;

export type TimerStore = {
  getState: () => TimerState;
  setState: (nextState: TimerState) => void;
  subscribe: (listener: TimerStoreListener) => () => void;
};

function createTimerStore(initialState: TimerState): TimerStore {
  let state = initialState;
  const listeners = new Set<TimerStoreListener>();

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
  clock: SystemClock;
  storage: StoragePort;
  timerStore: TimerStore;
  structureStorage: TournamentStructureStorage;
  timerUsecase: TimerUsecase;
};

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  const storage: StoragePort = new LocalStorageStorage();
  const timerStore = createTimerStore(
    createInitialTimerState(sampleTournamentStructure),
  );
  const structureStorage = new TournamentStructureStorage(storage);
  const timerUsecase = new TimerUsecase({ clock, timerStore });

  return {
    clock,
    storage,
    timerStore,
    structureStorage,
    timerUsecase,
  };
}
