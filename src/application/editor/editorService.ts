import { applyEditorOperations, type EditorOperation } from "@/domain/editorOperation";
import { buildItemLabel, cloneStructure, type TournamentStructure } from "@/domain/tournamentStructure";
import { GAME_KIND_ORDER, type GameKindId } from "@/domain/blinds";

export type EditorState = {
  baseStructure: TournamentStructure;
  operations: EditorOperation[];
  undoneOperations: EditorOperation[];
  isEditable: boolean;
};

export type EditorBlindCellView = {
  gameKind: GameKindId;
  sb: string;
  bb: string;
  ante: string;
};

export type EditorRowView = {
  itemId: string;
  itemIndex: number;
  itemNumber: number;
  itemKind: "level" | "break";
  itemLabel: string;
  durationMinutesText: string;
  blindCells: EditorBlindCellView[];
  canRemove: boolean;
  canEditBlinds: boolean;
};

export type EditorView = {
  title: string;
  defaultLevelDurationMinutesText: string;
  defaultBreakDurationMinutesText: string;
  isDirty: boolean;
  isEditable: boolean;
  canUndo: boolean;
  canRedo: boolean;
  rows: EditorRowView[];
};

function toCellText(value: number | null): string {
  return value === null ? "" : String(value);
}

function createRowView(structure: TournamentStructure, itemIndex: number): EditorRowView {
  const item = structure.items[itemIndex]!;
  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemKind: item.kind,
    itemLabel: buildItemLabel(structure, itemIndex),
    durationMinutesText: String(item.durationMinutes),
    blindCells: GAME_KIND_ORDER.map((gameKind) => {
      const triple = item.kind === "level" ? item.blinds[gameKind] : null;
      return {
        gameKind,
        sb: toCellText(triple?.sb ?? null),
        bb: toCellText(triple?.bb ?? null),
        ante: toCellText(triple?.ante ?? null),
      };
    }),
    canRemove: structure.items.length > 1,
    canEditBlinds: item.kind === "level",
  };
}

export class EditorService {
  createState(input: { structure: TournamentStructure; isEditable: boolean }): EditorState {
    return {
      baseStructure: cloneStructure(input.structure),
      operations: [],
      undoneOperations: [],
      isEditable: input.isEditable,
    };
  }

  materializeStructure(state: EditorState): TournamentStructure {
    return applyEditorOperations(state.baseStructure, state.operations);
  }

  appendOperation(input: { state: EditorState; operation: EditorOperation }): EditorState {
    return {
      ...input.state,
      operations: [...input.state.operations, input.operation],
      undoneOperations: [],
    };
  }

  undo(state: EditorState): EditorState {
    if (state.operations.length === 0) {
      return state;
    }
    const nextOperations = state.operations.slice(0, -1);
    const undone = state.operations[state.operations.length - 1]!;
    return {
      ...state,
      operations: nextOperations,
      undoneOperations: [undone, ...state.undoneOperations],
    };
  }

  redo(state: EditorState): EditorState {
    if (state.undoneOperations.length === 0) {
      return state;
    }
    const [nextOperation, ...remaining] = state.undoneOperations;
    return {
      ...state,
      operations: [...state.operations, nextOperation],
      undoneOperations: remaining,
    };
  }

  replaceBaseStructure(input: { state: EditorState; structure: TournamentStructure }): EditorState {
    return {
      ...input.state,
      baseStructure: cloneStructure(input.structure),
      operations: [],
      undoneOperations: [],
    };
  }

  setEditable(input: { state: EditorState; isEditable: boolean }): EditorState {
    return {
      ...input.state,
      isEditable: input.isEditable,
    };
  }

  createView(state: EditorState): EditorView {
    const structure = this.materializeStructure(state);
    return {
      title: structure.name,
      defaultLevelDurationMinutesText: String(structure.defaultLevelDurationMinutes),
      defaultBreakDurationMinutesText: String(structure.defaultBreakDurationMinutes),
      isDirty: state.operations.length > 0,
      isEditable: state.isEditable,
      canUndo: state.operations.length > 0,
      canRedo: state.undoneOperations.length > 0,
      rows: structure.items.map((_, itemIndex) => createRowView(structure, itemIndex)),
    };
  }
}
