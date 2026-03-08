import {
  GAME_KIND_ORDER,
  cloneBlindGroups,
  createDefaultBlindGroups,
  normalizeBlindGroups,
  upsertBlindValue,
} from "@/domain/models/blinds";
import type { EditorState, EditOperation } from "@/domain/models/editor";
import {
  assertTimerStructure,
  buildDerivedItemName,
  cloneTimerStructure,
  createBreakItem,
  createLevelItem,
  type LevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import type {
  EditorRowSnapshot,
  EditorSnapshot,
} from "@/usecases/editor/editorSnapshot";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createInsertedLevel(
  structure: TimerStructure,
  itemIndex: number,
): TimerItem {
  const inherited = findNearestLevelBlindGroups(structure.items, itemIndex);
  return createLevelItem({
    id: createId("lv"),
    durationSec: structure.defaultLevelDurationSec,
    blindGroups: inherited,
  });
}

function createInsertedBreak(structure: TimerStructure): TimerItem {
  return createBreakItem({
    id: createId("br"),
    durationSec: structure.defaultBreakDurationSec,
  });
}

function findNearestLevelBlindGroups(
  items: TimerItem[],
  baseIndex: number,
): LevelItem["blindGroups"] {
  for (let index = baseIndex; index >= 0; index -= 1) {
    const item = items[index];
    if (item?.kind === "level") {
      return cloneBlindGroups(item.blindGroups);
    }
  }

  for (let index = baseIndex + 1; index < items.length; index += 1) {
    const item = items[index];
    if (item?.kind === "level") {
      return cloneBlindGroups(item.blindGroups);
    }
  }

  return createDefaultBlindGroups();
}

function applyOperation(
  structure: TimerStructure,
  operation: EditOperation,
): TimerStructure {
  const next = cloneTimerStructure(structure);
  const item = next.items[operation.itemIndex];

  switch (operation.type) {
    case "insert-level-after": {
      next.items.splice(
        operation.itemIndex + 1,
        0,
        createInsertedLevel(next, operation.itemIndex),
      );
      return next;
    }

    case "insert-break-after": {
      next.items.splice(operation.itemIndex + 1, 0, createInsertedBreak(next));
      return next;
    }

    case "remove-item": {
      if (next.items.length > 1) {
        next.items.splice(operation.itemIndex, 1);
      }
      return next;
    }

    case "change-item-kind": {
      if (!item || item.kind === operation.kind) {
        return next;
      }

      if (operation.kind === "break") {
        next.items[operation.itemIndex] = createBreakItem({
          id: item.id,
          name: item.name,
          durationSec: item.durationSec,
        });
        return next;
      }

      next.items[operation.itemIndex] = createLevelItem({
        id: item.id,
        name: item.name,
        durationSec: item.durationSec,
        blindGroups: findNearestLevelBlindGroups(
          next.items,
          operation.itemIndex - 1,
        ),
      });
      return next;
    }

    case "set-duration-minutes": {
      if (!item) {
        return next;
      }
      item.durationSec = Math.max(0, Math.floor(operation.minutes)) * 60;
      return next;
    }

    case "set-blind-value": {
      if (!item || item.kind !== "level") {
        return next;
      }
      item.blindGroups = upsertBlindValue(
        normalizeBlindGroups(item.blindGroups),
        operation.gameKind,
        operation.slot,
        operation.value,
      );
      return next;
    }

    default:
      return next;
  }
}

function toRowSnapshot(
  structure: TimerStructure,
  item: TimerItem,
  itemIndex: number,
): EditorRowSnapshot {
  const blindGroups =
    item.kind === "level" ? normalizeBlindGroups(item.blindGroups) : [];

  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemKind: item.kind,
    itemLabel: buildDerivedItemName(structure, itemIndex),
    durationMinutesText: String(Math.floor(item.durationSec / 60)),
    blindCells: GAME_KIND_ORDER.map((gameKind) => {
      const group = blindGroups.find(
        (blindGroup) => blindGroup.gameKind === gameKind,
      );

      return {
        gameKind,
        sb:
          group?.values.sb === null || group?.values.sb === undefined
            ? ""
            : String(group.values.sb),
        bb:
          group?.values.bb === null || group?.values.bb === undefined
            ? ""
            : String(group.values.bb),
        ante:
          group?.values.ante === null || group?.values.ante === undefined
            ? ""
            : String(group.values.ante),
      };
    }),
    canRemove: structure.items.length > 1,
    canEditBlinds: item.kind === "level",
  };
}

export class EditorUsecase {
  createState(input: {
    structure: TimerStructure;
    isEditable: boolean;
  }): EditorState {
    return {
      baseStructure: cloneTimerStructure(input.structure),
      operations: [],
      undoneOperations: [],
      isEditable: input.isEditable,
    };
  }

  materializeStructure(state: EditorState): TimerStructure {
    const materialized = state.operations.reduce(
      (current, operation) => applyOperation(current, operation),
      cloneTimerStructure(state.baseStructure),
    );
    return assertTimerStructure(materialized);
  }

  isDirty(state: EditorState): boolean {
    return state.operations.length > 0;
  }

  canUndo(state: EditorState): boolean {
    return state.operations.length > 0;
  }

  canRedo(state: EditorState): boolean {
    return state.undoneOperations.length > 0;
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
    if (!state.operations.length) {
      return state;
    }

    const nextOperations = state.operations.slice(0, -1);
    const lastOperation = state.operations[state.operations.length - 1];

    return {
      ...state,
      operations: nextOperations,
      undoneOperations: [lastOperation, ...state.undoneOperations],
    };
  }

  redo(state: EditorState): EditorState {
    if (!state.undoneOperations.length) {
      return state;
    }

    const [nextOperation, ...remainingUndone] = state.undoneOperations;

    return {
      ...state,
      operations: [...state.operations, nextOperation],
      undoneOperations: remainingUndone,
    };
  }

  replaceBaseStructure(input: {
    state: EditorState;
    structure: TimerStructure;
  }): EditorState {
    return {
      ...input.state,
      baseStructure: cloneTimerStructure(input.structure),
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

  setEditable(input: {
    state: EditorState;
    isEditable: boolean;
  }): EditorState {
    return {
      ...input.state,
      isEditable: input.isEditable,
    };
  }

  createSnapshot(state: EditorState): EditorSnapshot {
    const structure = this.materializeStructure(state);

    return {
      title: structure.name,
      isDirty: this.isDirty(state),
      isEditable: state.isEditable,
      canUndo: this.canUndo(state),
      canRedo: this.canRedo(state),
      rows: structure.items.map((item, itemIndex) =>
        toRowSnapshot(structure, item, itemIndex),
      ),
    };
  }
}
