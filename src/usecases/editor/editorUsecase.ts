import {
  applyEditOperations,
  type EditOperation,
} from "@/domain/entities/editOperation";
import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

export type EditorState = {
  baseStructure: TournamentStructure;
  operations: EditOperation[];
  isEditable: boolean;
};

export function createEditorState(input: {
  structure: TournamentStructure;
  isEditable: boolean;
}): EditorState {
  return {
    baseStructure: input.structure,
    operations: [],
    isEditable: input.isEditable,
  };
}

export function appendEditOperation(input: {
  state: EditorState;
  operation: EditOperation;
}): EditorState {
  if (!input.state.isEditable) {
    return input.state;
  }

  return {
    ...input.state,
    operations: [...input.state.operations, input.operation],
  };
}

export function materializeEditorStructure(state: EditorState): TournamentStructure {
  return applyEditOperations(state.baseStructure, state.operations);
}

export function resetEditorChanges(state: EditorState): EditorState {
  return {
    ...state,
    operations: [],
  };
}

export function replaceEditorBaseStructure(input: {
  state: EditorState;
  structure: TournamentStructure;
}): EditorState {
  return {
    ...input.state,
    baseStructure: input.structure,
    operations: [],
  };
}

export function isEditorDirty(state: EditorState): boolean {
  return state.operations.length > 0;
}
