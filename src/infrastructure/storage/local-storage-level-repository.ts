import type { LevelRepository } from "@/entities/level/api/level-repository";
import type { LevelDef } from "@/entities/level";
import { SAMPLE_LEVELS } from "@/entities/level";

type StoredPayload = {
  version: 1;
  levels: LevelDef[];
};

const STORAGE_KEY = "poker-timer.levels.v1";

function safeParse(json: string): StoredPayload | null {
  try {
    const obj = JSON.parse(json) as StoredPayload;
    if (!obj || obj.version !== 1 || !Array.isArray(obj.levels)) return null;
    return obj;
  } catch {
    return null;
  }
}

export class LocalStorageLevelRepository implements LevelRepository {
  getLevels(): LevelDef[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_LEVELS;

    const parsed = safeParse(raw);
    if (!parsed) return SAMPLE_LEVELS;

    // ここで厳密バリデーション（zod等）を入れる余地あり（将来）
    return parsed.levels;
  }

  saveLevels(levels: LevelDef[]): void {
    const payload: StoredPayload = { version: 1, levels };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  clearLevels(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}