import type { BlindStructure } from "@/domain/entities/blind-structure";
import type { BlindStructurePresetRepository } from "@/usecases/ports/blind-structure-preset-repository";

export async function listPresets(repo: BlindStructurePresetRepository) {
  return repo.list();
}

export async function loadPreset(repo: BlindStructurePresetRepository, id: string) {
  return repo.load(id);
}

export async function savePreset(repo: BlindStructurePresetRepository, name: string, structure: BlindStructure) {
  if (!name.trim()) throw new Error("Preset name is required.");
  return repo.save(name.trim(), structure);
}