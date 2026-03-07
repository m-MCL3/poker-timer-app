import type { EditOperation } from "@/domain/entities/editOperation";
import type {
  TournamentStructure,
  TournamentStructureItem,
} from "@/domain/entities/tournamentStructure";
import { cloneTournamentStructure } from "@/domain/entities/tournamentStructure";
import type {
  EditorSnapshot,
  EditorRowSnapshot,
} from "@/usecases/editor/editorSnapshot";

export type EditorState = {
  baseStructure: TournamentStructure;
  operations: EditOperation[];
  isEditable: boolean;
};

function createDefaultLevelItem(input: {
  id: string;
  durationMs: number;
}): Extract<TournamentStructureItem, { kind: "level" }> {
  return {
    id: input.id,
    kind: "level",
    durationMs: input.durationMs,
    blinds: {
      fl: { sb: null, bb: null, ante: null },
      stud: { sb: null, bb: null, ante: null },
      nlpl: { sb: null, bb: null, ante: null },
    },
  };
}

function createDefaultBreakItem(input: {
  id: string;
  durationMs: number;
}): Extract<TournamentStructureItem, { kind: "break" }> {
  return {
    id: input.id,
    kind: "break",
    durationMs: input.durationMs,
  };
}

function cloneItem(item: TournamentStructureItem): TournamentStructureItem {
  if (item.kind === "break") {
    return { ...item };
  }

  return {
    ...item,
    blinds: {
      fl: { ...item.blinds.fl },
      stud: { ...item.blinds.stud },
      nlpl: { ...item.blinds.nlpl },
    },
  };
}

function buildInsertedItem(
  structure: TournamentStructure,
  itemKind: "level" | "break",
  itemIndex: number,
): TournamentStructureItem {
  if (itemKind === "break") {
    return createDefaultBreakItem({
      id: `break-${Date.now()}-${itemIndex + 1}`,
      durationMs: structure.defaultBreakDurationMs,
    });
  }

  return createDefaultLevelItem({
    id: `level-${Date.now()}-${itemIndex + 1}`,
    durationMs: structure.defaultLevelDurationMs,
  });
}

function applyOperation(
  structure: TournamentStructure,
  operation: EditOperation,
): TournamentStructure {
  const items = structure.items.map(cloneItem);

  switch (operation.type) {
    case "insert-level-after": {
      items.splice(
        operation.itemIndex + 1,
        0,
        buildInsertedItem(structure, "level", operation.itemIndex),
      );
      return { ...structure, items };
    }

    case "insert-break-after": {
      items.splice(
        operation.itemIndex + 1,
        0,
        buildInsertedItem(structure, "break", operation.itemIndex),
      );
      return { ...structure, items };
    }

    case "remove-item": {
      if (items.length <= 1) {
        return structure;
      }

      items.splice(operation.itemIndex, 1);
      return { ...structure, items };
    }

    case "change-item-kind": {
      const current = items[operation.itemIndex];
      if (!current) {
        return structure;
      }

      items[operation.itemIndex] = buildInsertedItem(
        structure,
        operation.kind,
        operation.itemIndex,
      );

      items[operation.itemIndex].id = current.id;
      items[operation.itemIndex].durationMs = current.durationMs;

      return { ...structure, items };
    }

    case "set-duration-minutes": {
      const current = items[operation.itemIndex];
      if (!current) {
        return structure;
      }

      current.durationMs = Math.max(0, operation.minutes) * 60_000;
      return { ...structure, items };
    }

    case "set-blind-value": {
      const current = items[operation.itemIndex];
      if (!current || current.kind !== "level") {
        return structure;
      }

      current.blinds[operation.gameKind][operation.slot] = operation.value;
      return { ...structure, items };
    }

    default:
      return structure;
  }
}

function toDisplayLabel(
  structure: TournamentStructure,
  itemIndex: number,
): string {
  const item = structure.items[itemIndex];

  if (item.kind === "break") {
    return "BREAK";
  }

  let levelNumber = 0;
  for (let index = 0; index <= itemIndex; index += 1) {
    if (structure.items[index].kind === "level") {
      levelNumber += 1;
    }
  }

  return `LEVEL ${levelNumber}`;
}

function toRowSnapshot(
  structure: TournamentStructure,
  item: TournamentStructureItem,
  itemIndex: number,
): EditorRowSnapshot {
  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemKind: item.kind,
    itemLabel: toDisplayLabel(structure, itemIndex),
    durationMinutesText: String(Math.floor(item.durationMs / 60_000)),
    blindCells: (["fl", "stud", "nlpl"] as const).map((gameKind) => {
      if (item.kind === "break") {
        return {
          gameKind,
          sb: "",
          bb: "",
          ante: "",
        };
      }

      const triple = item.blinds[gameKind];

      return {
        gameKind,
        sb: triple.sb === null ? "" : String(triple.sb),
        bb: triple.bb === null ? "" : String(triple.bb),
        ante: triple.ante === null ? "" : String(triple.ante),
      };
    }),
    canRemove: structure.items.length > 1,
    canEditBlinds: item.kind === "level",
  };
}

export function createEditorState(input: {
  structure: TournamentStructure;
  isEditable: boolean;
}): EditorState {
  return {
    baseStructure: cloneTournamentStructure(input.structure),
    operations: [],
    isEditable: input.isEditable,
  };
}

export function materializeEditorStructure(
  state: EditorState,
): TournamentStructure {
  return state.operations.reduce(
    (structure, operation) => applyOperation(structure, operation),
    cloneTournamentStructure(state.baseStructure),
  );
}

export function isEditorDirty(state: EditorState): boolean {
  return state.operations.length > 0;
}

export function appendEditOperation(input: {
  state: EditorState;
  operation: EditOperation;
}): EditorState {
  return {
    ...input.state,
    operations: [...input.state.operations, input.operation],
  };
}

export function replaceEditorBaseStructure(input: {
  state: EditorState;
  structure: TournamentStructure;
}): EditorState {
  return {
    ...input.state,
    baseStructure: cloneTournamentStructure(input.structure),
    operations: [],
  };
}

export function resetEditorChanges(state: EditorState): EditorState {
  return {
    ...state,
    operations: [],
  };
}

export function createEditorSnapshot(state: EditorState): EditorSnapshot {
  const structure = materializeEditorStructure(state);

  return {
    title: structure.title,
    isDirty: isEditorDirty(state),
    isEditable: state.isEditable,
    rows: structure.items.map((item, itemIndex) =>
      toRowSnapshot(structure, item, itemIndex),
    ),
  };
}
