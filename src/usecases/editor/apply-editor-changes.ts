import type { BlindStructure } from "@/domain/entities/blind-structure";
import type { TimerReader } from "@/usecases/ports/timer-reader";
import type { TimerWriter } from "@/usecases/ports/timer-writer";

export type ApplyEditorInput = {
  structure: BlindStructure;
  // optional: current level remaining override (sec)
  currentLevelRemainingSec?: number;
};

export function applyEditorChanges(timerR: TimerReader, timerW: TimerWriter, input: ApplyEditorInput) {
  const snap = timerR.getSnapshot();
  if (snap.state === "running") {
    throw new Error("Timer is running; editor is read-only.");
  }

  // structure replace (state/index remain as-is by timer design)
  timerW.applyStructure(input.structure);

  // remaining shortens only (A spec)
  if (typeof input.currentLevelRemainingSec === "number" && Number.isFinite(input.currentLevelRemainingSec)) {
    const editedMs = Math.max(0, Math.floor(input.currentLevelRemainingSec * 1000));
    const newRemaining = Math.min(snap.remainingMs, editedMs);
    timerW.setRemainingMs(newRemaining);
  }
}