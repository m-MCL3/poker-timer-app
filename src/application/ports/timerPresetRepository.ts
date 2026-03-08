import type { TimerStructure } from "@/domain/entities/timerStructure";

export type TimerPresetSummary = {
  name: string;
  updatedAtEpochMs: number;
};

export interface TimerPresetRepository {
  list(): Promise<TimerPresetSummary[]>;
  save(name: string, structure: TimerStructure): Promise<void>;
  load(name: string): Promise<TimerStructure | null>;
  rename(currentName: string, nextName: string): Promise<void>;
  delete(name: string): Promise<void>;
}
