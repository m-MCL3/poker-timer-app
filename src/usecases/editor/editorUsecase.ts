import type { EditOperation } from "@/domain/entities/editOperation";
import { applyEditOperations } from "@/domain/entities/editOperation";
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

function buildItemLabel(
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
    itemLabel: buildItemLabel(structure, itemIndex),
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
  return applyEditOperations(
    cloneTournamentStructure(state.baseStructure),
    state.operations,
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
