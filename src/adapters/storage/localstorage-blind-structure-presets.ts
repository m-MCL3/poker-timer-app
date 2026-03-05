import type { BlindStructure } from "@/domain/entities/blind-structure";
import type { BlindStructurePresetRepository, PresetSummary } from "@/usecases/ports/blind-structure-preset-repository";

type StoredPreset = {
  id: string;
  name: string;
  updatedAtMs: number;
  structure: BlindStructure;
};

const KEY = "pokerTimer.blindPresets.v1";

function readAll(): StoredPreset[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(presets: StoredPreset[]) {
  localStorage.setItem(KEY, JSON.stringify(presets));
}

function newId() {
  // 충분: local only. server版にしたらuuidへ
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class LocalStorageBlindStructurePresetRepository implements BlindStructurePresetRepository {
  async list(): Promise<PresetSummary[]> {
    return readAll()
      .slice()
      .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
      .map((p) => ({ id: p.id, name: p.name, updatedAtMs: p.updatedAtMs }));
  }

  async load(id: string): Promise<BlindStructure> {
    const found = readAll().find((p) => p.id === id);
    if (!found) throw new Error("Preset not found.");
    return found.structure;
  }

  async save(name: string, structure: BlindStructure): Promise<void> {
    const presets = readAll();
    const now = Date.now();

    // 同名があれば上書き（扱いは好みだけど、ローカルならこれが楽）
    const existing = presets.find((p) => p.name === name);
    if (existing) {
      existing.updatedAtMs = now;
      existing.structure = structure;
    } else {
      presets.push({ id: newId(), name, updatedAtMs: now, structure });
    }

    writeAll(presets);
  }
}