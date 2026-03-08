import type { StructurePresetSummary } from "@/domain/preset";
import type { TournamentStructure } from "@/domain/tournamentStructure";

export interface StructurePresetRepository {
  listPresets(): Promise<StructurePresetSummary[]>;
  savePreset(name: string, structure: TournamentStructure): Promise<void>;
  loadPreset(name: string): Promise<TournamentStructure | null>;
  renamePreset(currentName: string, nextName: string): Promise<void>;
  deletePreset(name: string): Promise<void>;
}
