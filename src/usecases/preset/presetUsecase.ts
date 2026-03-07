import type { StructurePresetSummary } from "@/domain/entities/structurePreset";
import { sortPresetSummaries } from "@/domain/entities/structurePreset";

export function normalizePresetName(name: string): string {
  return name.trim();
}

export function validatePresetName(name: string): string | null {
  if (!name.trim()) {
    return "プリセット名を入力してください。";
  }

  return null;
}

export function validateRenamePresetName(input: {
  currentName: string;
  nextName: string;
}): string | null {
  const currentName = normalizePresetName(input.currentName);
  const nextName = normalizePresetName(input.nextName);

  if (!currentName) {
    return "変更元のプリセットを選択してください。";
  }

  if (!nextName) {
    return "変更後のプリセット名を入力してください。";
  }

  if (currentName === nextName) {
    return "変更後のプリセット名が同じです。";
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

export function buildPresetSummaries(
  presets: StructurePresetSummary[],
): StructurePresetSummary[] {
  return sortPresetSummaries(presets);
}
