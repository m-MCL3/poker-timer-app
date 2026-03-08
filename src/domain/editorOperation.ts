import {
  cloneStructure,
  createBreakItem,
  createLevelItem,
  type StructureItem,
  type TournamentStructure,
} from "@/domain/tournamentStructure";
import { createEmptyBlinds, normalizeBlindValue, type BlindSlotId, type GameKindId } from "@/domain/blinds";

export type EditorOperation =
  | { type: "insert-level"; index: number; itemId: string }
  | { type: "insert-break"; index: number; itemId: string }
  | { type: "remove-item"; index: number }
  | { type: "set-item-kind"; index: number; kind: "level" | "break"; itemId: string }
  | { type: "set-duration"; index: number; durationMinutes: number }
  | { type: "set-blind"; index: number; gameKind: GameKindId; slot: BlindSlotId; value: number | null }
  | { type: "set-name"; name: string }
  | { type: "set-default-level-duration"; durationMinutes: number }
  | { type: "set-default-break-duration"; durationMinutes: number };

function insertItem(items: StructureItem[], index: number, item: StructureItem): StructureItem[] {
  const next = [...items];
  const safeIndex = Math.max(0, Math.min(index, items.length));
  next.splice(safeIndex, 0, item);
  return next;
}

export function applyEditorOperations(
  baseStructure: TournamentStructure,
  operations: EditorOperation[],
): TournamentStructure {
  return operations.reduce((current, operation) => applyEditorOperation(current, operation), cloneStructure(baseStructure));
}

function applyEditorOperation(
  structure: TournamentStructure,
  operation: EditorOperation,
): TournamentStructure {
  const next = cloneStructure(structure);

  switch (operation.type) {
    case "set-name":
      next.name = operation.name;
      return next;

    case "set-default-level-duration":
      next.defaultLevelDurationMinutes = Math.max(0, Math.floor(operation.durationMinutes));
      return next;

    case "set-default-break-duration":
      next.defaultBreakDurationMinutes = Math.max(0, Math.floor(operation.durationMinutes));
      return next;

    case "insert-level":
      next.items = insertItem(
        next.items,
        operation.index,
        createLevelItem({
          id: operation.itemId,
          durationMinutes: next.defaultLevelDurationMinutes,
          blinds: createEmptyBlinds(),
        }),
      );
      return next;

    case "insert-break":
      next.items = insertItem(
        next.items,
        operation.index,
        createBreakItem({
          id: operation.itemId,
          durationMinutes: next.defaultBreakDurationMinutes,
        }),
      );
      return next;

    case "remove-item":
      if (next.items.length <= 1) {
        return next;
      }
      next.items = next.items.filter((_, index) => index !== operation.index);
      return next;

    case "set-item-kind": {
      const currentItem = next.items[operation.index];
      if (!currentItem) {
        return next;
      }
      next.items[operation.index] =
        operation.kind === "break"
          ? createBreakItem({ id: operation.itemId, durationMinutes: currentItem.durationMinutes })
          : createLevelItem({
              id: operation.itemId,
              durationMinutes: currentItem.durationMinutes,
              blinds: currentItem.kind === "level" ? currentItem.blinds : createEmptyBlinds(),
            });
      return next;
    }

    case "set-duration": {
      const currentItem = next.items[operation.index];
      if (!currentItem) {
        return next;
      }
      next.items[operation.index] =
        currentItem.kind === "break"
          ? createBreakItem({ id: currentItem.id, durationMinutes: operation.durationMinutes })
          : createLevelItem({
              id: currentItem.id,
              durationMinutes: operation.durationMinutes,
              blinds: currentItem.blinds,
            });
      return next;
    }

    case "set-blind": {
      const currentItem = next.items[operation.index];
      if (!currentItem || currentItem.kind === "break") {
        return next;
      }
      next.items[operation.index] = createLevelItem({
        id: currentItem.id,
        durationMinutes: currentItem.durationMinutes,
        blinds: {
          ...currentItem.blinds,
          [operation.gameKind]: {
            ...currentItem.blinds[operation.gameKind],
            [operation.slot]: normalizeBlindValue(operation.value),
          },
        },
      });
      return next;
    }
  }
}
