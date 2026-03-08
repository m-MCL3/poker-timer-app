import {
  sortPresetSummaries,
  type StructurePresetSummary,
} from "@/domain/entities/structurePreset";
import type { TournamentStructure } from "@/domain/entities/tournamentStructure";
import type { StructurePresetRepository } from "@/usecases/ports/structurePresetRepository";

export class PresetUsecase {
  constructor(private readonly repository: StructurePresetRepository) {}

  normalizeName(name: string): string {
    return name.trim();
  }

  validateName(name: string): string | null {
    const normalized = this.normalizeName(name);
    if (!normalized) {
      return "プリセット名を入力してください。";
    }

    return null;
  }

  hasPreset(presets: StructurePresetSummary[], name: string): boolean {
    const normalized = this.normalizeName(name);
    return presets.some((preset) => preset.name === normalized);
  }

  async listPresets(): Promise<StructurePresetSummary[]> {
    return sortPresetSummaries(await this.repository.listPresets());
  }

  async savePreset(name: string, structure: TournamentStructure): Promise<void> {
    const normalized = this.normalizeName(name);
    const validationError = this.validateName(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    await this.repository.savePreset(normalized, structure);
  }

  async loadPreset(name: string): Promise<TournamentStructure | null> {
    return this.repository.loadPreset(this.normalizeName(name));
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    const current = this.normalizeName(currentName);
    const next = this.normalizeName(nextName);
    const validationError = this.validateName(next);
    if (validationError) {
      throw new Error(validationError);
    }

    if (current === next) {
      return;
    }

    await this.repository.renamePreset(current, next);
  }

  async deletePreset(name: string): Promise<void> {
    await this.repository.deletePreset(this.normalizeName(name));
  }
}
