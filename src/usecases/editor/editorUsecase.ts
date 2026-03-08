import {
  cloneBlindGroups,
  createDefaultBlindGroups,
  ensureBlindGroups,
  findBlindGroup,
  type BlindSlotId,
  type GameKindId,
} from "@/domain/models/blinds";
import type { EditOperation, EditorState } from "@/domain/models/editorState";
import {
  cloneTimerStructure,
  createBreakItem,
  createLevelItem,
  type LevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";
import type {
  EditorBlindCellSnapshot,
  EditorRowSnapshot,
  EditorSnapshot,
} from "@/usecases/editor/editorSnapshot";
import type { IdGenerator } from "@/usecases/ports/idGenerator";

function createEditorState(input: {
  structure: TimerStructure;
  isEditable: boolean;
}): EditorState {
  return {
    baseStructure: cloneTimerStructure(input.structure),
    operations: [],
    isEditable: input.isEditable,
  };
}

function buildItemLabel(structure: TimerStructure, itemIndex: number): string {
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

function findNearestLevelBlindGroups(items: TimerItem[], baseIndex: number) {
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

function applyOperation(structure: TimerStructure, operation: EditOperation, idGenerator: IdGenerator): void {
  const item = structure.items[operation.itemIndex];

  switch (operation.type) {
    case "insert-level-after": {
      structure.items.splice(
        operation.itemIndex + 1,
        0,
        createLevelItem({
          id: idGenerator.nextId("lv"),
          durationSec: structure.defaultLevelDurationSec,
          blindGroups: findNearestLevelBlindGroups(structure.items, operation.itemIndex),
        }),
      );
      return;
    }
    case "insert-break-after": {
      structure.items.splice(
        operation.itemIndex + 1,
        0,
        createBreakItem({
          id: idGenerator.nextId("br"),
          durationSec: structure.defaultBreakDurationSec,
        }),
      );
      return;
    }
    case "remove-item": {
      if (structure.items.length <= 1) {
        return;
      }
      structure.items.splice(operation.itemIndex, 1);
      return;
    }
    case "change-item-kind": {
      if (!item || item.kind === operation.kind) {
        return;
      }

      if (operation.kind === "break") {
        structure.items[operation.itemIndex] = createBreakItem({
          id: item.id,
          durationSec: item.durationSec,
        });
        return;
      }

      structure.items[operation.itemIndex] = createLevelItem({
        id: item.id,
        durationSec: item.durationSec,
        blindGroups: findNearestLevelBlindGroups(structure.items, operation.itemIndex - 1),
      });
      return;
    }
    case "set-duration-minutes": {
      if (!item) {
        return;
      }
      item.durationSec = Math.max(0, Math.floor(operation.minutes)) * 60;
      return;
    }
    case "set-blind-value": {
      if (!item || item.kind !== "level") {
        return;
      }
      const blindGroup = findBlindGroup(item.blindGroups, operation.gameKind);
      if (!blindGroup) {
        return;
      }
      blindGroup.values[operation.slot] = operation.value;
      return;
    }
  }
}

function materializeEditorStructure(state: EditorState, idGenerator: IdGenerator): TimerStructure {
  const next = cloneTimerStructure(state.baseStructure);
  next.items.forEach((item) => {
    if (item.kind === "level") {
      item.blindGroups = ensureBlindGroups(item.blindGroups);
    }
  });

  state.operations.forEach((operation) => applyOperation(next, operation, idGenerator));
  return next;
}

function isEditorDirty(state: EditorState): boolean {
  return state.operations.length > 0;
}

function toBlindCellSnapshot(item: TimerItem, gameKind: GameKindId): EditorBlindCellSnapshot {
  if (item.kind === "break") {
    return { gameKind, sb: "", bb: "", ante: "" };
  }

  const blindGroup = findBlindGroup(item.blindGroups, gameKind);
  return {
    gameKind,
    sb: blindGroup?.values.sb === null ? "" : String(blindGroup?.values.sb ?? ""),
    bb: blindGroup?.values.bb === null ? "" : String(blindGroup?.values.bb ?? ""),
    ante: blindGroup?.values.ante === null ? "" : String(blindGroup?.values.ante ?? ""),
  };
}

function toRowSnapshot(structure: TimerStructure, item: TimerItem, itemIndex: number): EditorRowSnapshot {
  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemKind: item.kind,
    itemLabel: buildItemLabel(structure, itemIndex),
    durationMinutesText: String(Math.floor(item.durationSec / 60)),
    blindCells: ["fl", "stud", "nlpl"].map((gameKind) =>
      toBlindCellSnapshot(item, gameKind as GameKindId),
    ),
    canRemove: structure.items.length > 1,
    canEditBlinds: item.kind === "level",
  };
}

function createEditorSnapshot(state: EditorState, idGenerator: IdGenerator): EditorSnapshot {
  const structure = materializeEditorStructure(state, idGenerator);
  return {
    title: structure.name,
    isDirty: isEditorDirty(state),
    isEditable: state.isEditable,
    rows: structure.items.map((item, itemIndex) => toRowSnapshot(structure, item, itemIndex)),
  };
}

export class EditorUsecase {
  private state: EditorState;

  private readonly listeners = new Set<() => void>();

  constructor(
    input: { structure: TimerStructure; isEditable: boolean },
    private readonly idGenerator: IdGenerator,
  ) {
    this.state = createEditorState(input);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): EditorSnapshot {
    return createEditorSnapshot(this.state, this.idGenerator);
  }

  syncEditable(isEditable: boolean): void {
    if (this.state.isEditable === isEditable) {
      return;
    }

    this.state = {
      ...this.state,
      isEditable,
    };
    this.emit();
  }

  replaceBaseStructure(structure: TimerStructure): void {
    this.state = {
      ...this.state,
      baseStructure: cloneTimerStructure(structure),
      operations: [],
    };
    this.emit();
  }

  cancel(): void {
    if (!this.state.operations.length) {
      return;
    }

    this.state = {
      ...this.state,
      operations: [],
    };
    this.emit();
  }

  materialize(): TimerStructure {
    return materializeEditorStructure(this.state, this.idGenerator);
  }

  applyOperation(operation: EditOperation): void {
    this.state = {
      ...this.state,
      operations: [...this.state.operations, operation],
    };
    this.emit();
  }

  isDirty(): boolean {
    return isEditorDirty(this.state);
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export type { EditOperation, BlindSlotId, GameKindId };
