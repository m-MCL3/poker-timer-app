import type { BlindSlotId, GameKindId } from "@/domain/entities/blinds";

export type EditorBlindCellSnapshot = {
  gameKind: GameKindId;
  sb: string;
  bb: string;
  ante: string;
};

export type EditorRowSnapshot = {
  itemId: string;
  itemIndex: number;
  itemNumber: number;
  itemKind: "level" | "break";
  itemLabel: string;
  durationMinutesText: string;
  blindCells: EditorBlindCellSnapshot[];
  canRemove: boolean;
  canEditBlinds: boolean;
};

export type EditorSnapshot = {
  title: string;
  isDirty: boolean;
  isEditable: boolean;
  rows: EditorRowSnapshot[];
};
