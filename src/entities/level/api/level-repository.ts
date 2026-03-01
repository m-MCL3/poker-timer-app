import type { LevelDef } from "../model/types";

export interface LevelRepository {
  getLevels(): LevelDef[];

  // ✅ 追加：将来 Editor から保存するためのAPI
  saveLevels(levels: LevelDef[]): void;

  // ✅ 追加：保存データを消す（将来 Reset/Factory reset 用）
  clearLevels(): void;
}