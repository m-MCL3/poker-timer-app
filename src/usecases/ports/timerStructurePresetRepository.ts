import type { StructurePresetSummary } from "@/domain/models/preset";
import type { TimerStructure } from "@/domain/models/timerStructure";

export interface TimerStructurePresetRepository {
  listPresets(): Promise<StructurePresetSummary[]>;
  savePreset(name: string, structure: TimerStructure): Promise<void>;
  loadPreset(name: string): Promise<TimerStructure | null>;
  renamePreset(currentName: string, nextName: string): Promise<void>;
  deletePreset(name: string): Promise<void>;
}
