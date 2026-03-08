import type { PresetSummary } from "@/domain/models/preset";
import { sortPresetSummaries } from "@/domain/models/preset";
import type { TimerStructure } from "@/domain/models/timerStructure";
import type { PresetRepository } from "@/usecases/ports/presetRepository";

export class PresetUsecase {
  constructor(private readonly repository: PresetRepository) {}

  normalizeName(name: string): string {
    return name.trim();
  }

  validateName(name: string): string | null {
    if (!this.normalizeName(name)) {
      return "プリセット名を入力してください。";
    }
    return null;
  }

  hasPreset(presets: PresetSummary[], name: string): boolean {
    const normalized = this.normalizeName(name);
    return presets.some((preset) => preset.name === normalized);
  }

  formatList(presets: PresetSummary[]): PresetSummary[] {
    return sortPresetSummaries(presets);
  }

  async listPresets(): Promise<PresetSummary[]> {
    return this.formatList(await this.repository.listPresets());
  }

  async savePreset(name: string, structure: TimerStructure): Promise<void> {
    await this.repository.savePreset(this.normalizeName(name), structure);
  }

  async loadPreset(name: string): Promise<TimerStructure | null> {
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
