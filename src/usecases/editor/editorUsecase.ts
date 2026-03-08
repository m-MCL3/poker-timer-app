import {
  GAME_KIND_ORDER,
  type GameKindId,
} from "@/domain/entities/blinds";
import { applyEditOperations, type EditOperation } from "@/domain/entities/editOperation";
import {
  assertTournamentStructure,
  buildDerivedItemName,
  cloneTournamentStructure,
  type TournamentStructure,
} from "@/domain/entities/tournamentStructure";
import type { EditorRowSnapshot, EditorSnapshot } from "@/usecases/editor/editorSnapshot";

export type EditorState = {
  baseStructure: TournamentStructure;
  operations: EditOperation[];
  undoneOperations: EditOperation[];
  isEditable: boolean;
};

function toCellText(value: number | null): string {
  return value === null ? "" : String(value);
}

function createRowSnapshot(
  structure: TournamentStructure,
  itemIndex: number,
): EditorRowSnapshot {
  const item = structure.items[itemIndex]!;

  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemKind: item.kind,
    itemLabel: buildDerivedItemName(structure, itemIndex),
    durationMinutesText: String(item.durationMinutes),
    blindCells: GAME_KIND_ORDER.map((gameKind: GameKindId) => {
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

export class EditorUsecase {
  createState(input: {
    structure: TournamentStructure;
    isEditable: boolean;
  }): EditorState {
    return {
      baseStructure: cloneTournamentStructure(input.structure),
      operations: [],
      undoneOperations: [],
      isEditable: input.isEditable,
    };
  }

  materializeStructure(state: EditorState): TournamentStructure {
    return assertTournamentStructure(
      applyEditOperations(state.baseStructure, state.operations),
    );
  }

  appendOperation(input: {
    state: EditorState;
    operation: EditOperation;
  }): EditorState {
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

  replaceBaseStructure(input: {
    state: EditorState;
    structure: TournamentStructure;
  }): EditorState {
    return {
      ...input.state,
      baseStructure: cloneTournamentStructure(input.structure),
      operations: [],
      undoneOperations: [],
    };
  }

  resetChanges(state: EditorState): EditorState {
    return {
      ...state,
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

  createSnapshot(state: EditorState): EditorSnapshot {
    const structure = this.materializeStructure(state);

    return {
      title: structure.name,
      isDirty: state.operations.length > 0,
      isEditable: state.isEditable,
      canUndo: state.operations.length > 0,
      canRedo: state.undoneOperations.length > 0,
      rows: structure.items.map((_, itemIndex) =>
        createRowSnapshot(structure, itemIndex),
      ),
    };
  }
}
