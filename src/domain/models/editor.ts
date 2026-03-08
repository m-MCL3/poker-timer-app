import type { BlindSlotId, GameKindId } from "@/domain/models/blinds";
import type { TimerStructure } from "@/domain/models/timerStructure";

export type EditOperation =
  | { type: "insert-level-after"; itemIndex: number }
  | { type: "insert-break-after"; itemIndex: number }
  | { type: "remove-item"; itemIndex: number }
  | { type: "change-item-kind"; itemIndex: number; kind: "level" | "break" }
  | { type: "set-duration-minutes"; itemIndex: number; minutes: number }
  | {
      type: "set-blind-value";
      itemIndex: number;
      gameKind: GameKindId;
      slot: BlindSlotId;
      value: number | null;
    };

export type EditorState = {
  baseStructure: TimerStructure;
  operations: EditOperation[];
  undoneOperations: EditOperation[];
  isEditable: boolean;
};
