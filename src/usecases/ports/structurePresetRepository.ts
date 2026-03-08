import type { StructurePresetSummary } from "@/domain/entities/structurePreset";
import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

export interface StructurePresetRepository {
  listPresets(): Promise<StructurePresetSummary[]>;
  savePreset(name: string, structure: TournamentStructure): Promise<void>;
  loadPreset(name: string): Promise<TournamentStructure | null>;
  renamePreset(currentName: string, nextName: string): Promise<void>;
  deletePreset(name: string): Promise<void>;
}
