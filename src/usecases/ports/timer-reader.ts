import type { TimerSnapshot } from "@/domain/entities/blind-structure";

export interface TimerReader {
  getSnapshot(): TimerSnapshot;
}