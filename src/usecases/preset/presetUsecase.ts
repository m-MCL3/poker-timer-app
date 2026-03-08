import type { StructurePresetSummary } from "@/domain/models/preset";
import { sortPresetSummaries } from "@/domain/models/preset";
import type { TimerStructure } from "@/domain/models/timerStructure";
import type { TimerStructurePresetRepository } from "@/usecases/ports/timerStructurePresetRepository";

export function normalizePresetName(name: string): string {
  return name.trim();
}

export function validatePresetName(name: string): string | null {
  if (!name.trim()) {
    return "プリセット名を入力してください。";
  }
  return null;
}

export function hasPreset(
  presets: StructurePresetSummary[],
  name: string,
): boolean {
  const normalized = normalizePresetName(name);
  return presets.some((preset) => preset.name === normalized);
}

export class PresetUsecase {
  constructor(private readonly repository: TimerStructurePresetRepository) {}

  async listSummaries(): Promise<StructurePresetSummary[]> {
    return sortPresetSummaries(await this.repository.listPresets());
  }

  async savePreset(name: string, structure: TimerStructure): Promise<void> {
    await this.repository.savePreset(normalizePresetName(name), structure);
  }

  async loadPreset(name: string): Promise<TimerStructure | null> {
    return this.repository.loadPreset(normalizePresetName(name));
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    await this.repository.renamePreset(
      normalizePresetName(currentName),
      normalizePresetName(nextName),
    );
  }

  async deletePreset(name: string): Promise<void> {
    await this.repository.deletePreset(normalizePresetName(name));
  }
}
