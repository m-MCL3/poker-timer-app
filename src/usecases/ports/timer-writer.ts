import type { BlindStructure } from "@/domain/entities/blind-structure";

export interface TimerWriter {
  applyStructure(structure: BlindStructure): void;
  setRemainingMs(remainingMs: number): void;
}