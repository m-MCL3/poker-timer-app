import type { BlindStructure } from "@/domain/entities/blind-structure";

export type PresetSummary = { id: string; name: string; updatedAtMs: number };

export interface BlindStructurePresetRepository {
  list(): Promise<PresetSummary[]>;
  load(id: string): Promise<BlindStructure>;
  save(name: string, structure: BlindStructure): Promise<void>;
}