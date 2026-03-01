import type { LevelRepository } from "@/entities/level/api/level-repository";
import type { LevelDef } from "@/entities/level";
import { SAMPLE_LEVELS } from "@/entities/level";

export class MemoryLevelRepository implements LevelRepository {
  private levels: LevelDef[] = SAMPLE_LEVELS;

  getLevels() {
    return this.levels;
  }

  saveLevels(levels: LevelDef[]) {
    this.levels = levels;
  }

  clearLevels() {
    this.levels = SAMPLE_LEVELS;
  }
}