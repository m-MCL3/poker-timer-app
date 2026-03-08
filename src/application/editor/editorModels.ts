import type { BlindSlot, GameKind } from "@/domain/entities/blinds";
import type { TimerStructure } from "@/domain/entities/timerStructure";

export type EditorDraft = {
  baseStructure: TimerStructure;
  workingStructure: TimerStructure;
  past: TimerStructure[];
  future: TimerStructure[];
  isEditable: boolean;
};

export type EditorRowSnapshot = {
  itemId: string;
  itemIndex: number;
  itemNumber: number;
  itemLabel: string;
  itemKind: "level" | "break";
  durationMinutesText: string;
  blindValues: Record<GameKind, Record<BlindSlot, string>>;
  canEditBlinds: boolean;
  canRemove: boolean;
};

export type EditorSnapshot = {
  title: string;
  isEditable: boolean;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  defaultLevelDurationText: string;
  defaultBreakDurationText: string;
  rows: EditorRowSnapshot[];
};
