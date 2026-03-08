import type { GameKindId } from "@/domain/models/blinds";

export type EditorRowBlindCell = {
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
  blindCells: EditorRowBlindCell[];
  canRemove: boolean;
  canEditBlinds: boolean;
};

export type EditorSnapshot = {
  title: string;
  isDirty: boolean;
  isEditable: boolean;
  rows: EditorRowSnapshot[];
};
