import { GAME_KIND_ORDER, createEmptyBlinds, type BlindSlot, type GameKind } from "@/domain/entities/blinds";
import {
  assertStructure,
  buildItemLabel,
  cloneStructure,
  createBreakItem,
  createLevelItem,
  normalizeDurationMinutes,
  type TimerStructure,
  type TimerStructureItem,
} from "@/domain/entities/timerStructure";
import type { EditorDraft, EditorRowSnapshot, EditorSnapshot } from "@/application/editor/editorModels";

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseOptionalInteger(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

function pushHistory(draft: EditorDraft, nextWorkingStructure: TimerStructure): EditorDraft {
  return {
    ...draft,
    workingStructure: nextWorkingStructure,
    past: [...draft.past, cloneStructure(draft.workingStructure)],
    future: [],
  };
}

function replaceStructureItem(
  structure: TimerStructure,
  itemIndex: number,
  item: TimerStructureItem,
): TimerStructure {
  return {
    ...cloneStructure(structure),
    items: structure.items.map((currentItem, currentIndex) =>
      currentIndex === itemIndex ? item : currentItem,
    ),
  };
}

function createDefaultLevel(structure: TimerStructure): TimerStructureItem {
  return createLevelItem({
    id: randomId("lv"),
    durationMinutes: structure.defaultLevelDurationMinutes,
    blinds: createEmptyBlinds(),
  });
}

function createDefaultBreak(structure: TimerStructure): TimerStructureItem {
  return createBreakItem({
    id: randomId("br"),
    durationMinutes: structure.defaultBreakDurationMinutes,
  });
}

function toText(value: number | null): string {
  return value === null ? "" : String(value);
}

function createRowSnapshot(
  structure: TimerStructure,
  itemIndex: number,
): EditorRowSnapshot {
  const item = structure.items[itemIndex]!;

  return {
    itemId: item.id,
    itemIndex,
    itemNumber: itemIndex + 1,
    itemLabel: buildItemLabel(structure, itemIndex),
    itemKind: item.kind,
    durationMinutesText: String(item.durationMinutes),
    blindValues: {
      fl: {
        sb: item.kind === "level" ? toText(item.blinds.fl.sb) : "",
        bb: item.kind === "level" ? toText(item.blinds.fl.bb) : "",
        ante: item.kind === "level" ? toText(item.blinds.fl.ante) : "",
      },
      stud: {
        sb: item.kind === "level" ? toText(item.blinds.stud.sb) : "",
        bb: item.kind === "level" ? toText(item.blinds.stud.bb) : "",
        ante: item.kind === "level" ? toText(item.blinds.stud.ante) : "",
      },
      nlpl: {
        sb: item.kind === "level" ? toText(item.blinds.nlpl.sb) : "",
        bb: item.kind === "level" ? toText(item.blinds.nlpl.bb) : "",
        ante: item.kind === "level" ? toText(item.blinds.nlpl.ante) : "",
      },
    },
    canEditBlinds: item.kind === "level",
    canRemove: structure.items.length > 1,
  };
}

export class EditorService {
  createDraft(input: {
    structure: TimerStructure;
    isEditable: boolean;
  }): EditorDraft {
    const cloned = cloneStructure(input.structure);

    return {
      baseStructure: cloned,
      workingStructure: cloneStructure(cloned),
      past: [],
      future: [],
      isEditable: input.isEditable,
    };
  }

  setEditable(draft: EditorDraft, isEditable: boolean): EditorDraft {
    return {
      ...draft,
      isEditable,
    };
  }

  renameStructure(draft: EditorDraft, name: string): EditorDraft {
    return pushHistory(draft, {
      ...cloneStructure(draft.workingStructure),
      name,
    });
  }

  setDefaultLevelDuration(draft: EditorDraft, text: string): EditorDraft {
    return pushHistory(draft, {
      ...cloneStructure(draft.workingStructure),
      defaultLevelDurationMinutes: normalizeDurationMinutes(Number(text)),
    });
  }

  setDefaultBreakDuration(draft: EditorDraft, text: string): EditorDraft {
    return pushHistory(draft, {
      ...cloneStructure(draft.workingStructure),
      defaultBreakDurationMinutes: normalizeDurationMinutes(Number(text)),
    });
  }

  insertLevelAfter(draft: EditorDraft, itemIndex: number): EditorDraft {
    const structure = cloneStructure(draft.workingStructure);
    structure.items.splice(itemIndex + 1, 0, createDefaultLevel(structure));
    return pushHistory(draft, structure);
  }

  insertBreakAfter(draft: EditorDraft, itemIndex: number): EditorDraft {
    const structure = cloneStructure(draft.workingStructure);
    structure.items.splice(itemIndex + 1, 0, createDefaultBreak(structure));
    return pushHistory(draft, structure);
  }

  removeItem(draft: EditorDraft, itemIndex: number): EditorDraft {
    if (draft.workingStructure.items.length <= 1) {
      return draft;
    }

    const structure = cloneStructure(draft.workingStructure);
    structure.items.splice(itemIndex, 1);
    return pushHistory(draft, structure);
  }

  setItemKind(
    draft: EditorDraft,
    itemIndex: number,
    nextKind: "level" | "break",
  ): EditorDraft {
    const structure = cloneStructure(draft.workingStructure);
    const currentItem = structure.items[itemIndex];
    if (!currentItem) {
      return draft;
    }

    const nextItem =
      nextKind === "level"
        ? createLevelItem({
            id: currentItem.id,
            durationMinutes:
              currentItem.kind === "level"
                ? currentItem.durationMinutes
                : structure.defaultLevelDurationMinutes,
            blinds:
              currentItem.kind === "level"
                ? currentItem.blinds
                : createEmptyBlinds(),
          })
        : createBreakItem({
            id: currentItem.id,
            durationMinutes:
              currentItem.kind === "break"
                ? currentItem.durationMinutes
                : structure.defaultBreakDurationMinutes,
          });

    return pushHistory(draft, replaceStructureItem(structure, itemIndex, nextItem));
  }

  setItemDuration(draft: EditorDraft, itemIndex: number, text: string): EditorDraft {
    const structure = cloneStructure(draft.workingStructure);
    const currentItem = structure.items[itemIndex];
    if (!currentItem) {
      return draft;
    }

    const nextDurationMinutes = normalizeDurationMinutes(Number(text));
    const nextItem =
      currentItem.kind === "break"
        ? createBreakItem({
            id: currentItem.id,
            durationMinutes: nextDurationMinutes,
          })
        : createLevelItem({
            id: currentItem.id,
            durationMinutes: nextDurationMinutes,
            blinds: currentItem.blinds,
          });

    return pushHistory(draft, replaceStructureItem(structure, itemIndex, nextItem));
  }

  setBlind(
    draft: EditorDraft,
    itemIndex: number,
    gameKind: GameKind,
    slot: BlindSlot,
    text: string,
  ): EditorDraft {
    const structure = cloneStructure(draft.workingStructure);
    const currentItem = structure.items[itemIndex];
    if (!currentItem || currentItem.kind != "level") {
      return draft;
    }

    const nextBlindValue = parseOptionalInteger(text);
    const nextItem = createLevelItem({
      id: currentItem.id,
      durationMinutes: currentItem.durationMinutes,
      blinds: {
        ...currentItem.blinds,
        [gameKind]: {
          ...currentItem.blinds[gameKind],
          [slot]: nextBlindValue,
        },
      },
    });

    return pushHistory(draft, replaceStructureItem(structure, itemIndex, nextItem));
  }

  undo(draft: EditorDraft): EditorDraft {
    const previous = draft.past[draft.past.length - 1];
    if (!previous) {
      return draft;
    }

    return {
      ...draft,
      workingStructure: cloneStructure(previous),
      past: draft.past.slice(0, -1),
      future: [cloneStructure(draft.workingStructure), ...draft.future],
    };
  }

  redo(draft: EditorDraft): EditorDraft {
    const [next, ...remaining] = draft.future;
    if (!next) {
      return draft;
    }

    return {
      ...draft,
      workingStructure: cloneStructure(next),
      past: [...draft.past, cloneStructure(draft.workingStructure)],
      future: remaining,
    };
  }

  replaceBaseStructure(draft: EditorDraft, structure: TimerStructure): EditorDraft {
    const normalized = assertStructure(structure);

    return {
      ...draft,
      baseStructure: cloneStructure(normalized),
      workingStructure: cloneStructure(normalized),
      past: [],
      future: [],
    };
  }

  resetChanges(draft: EditorDraft): EditorDraft {
    return {
      ...draft,
      workingStructure: cloneStructure(draft.baseStructure),
      past: [],
      future: [],
    };
  }

  materializeStructure(draft: EditorDraft): TimerStructure {
    return assertStructure(draft.workingStructure);
  }

  createSnapshot(draft: EditorDraft): EditorSnapshot {
    const working = this.materializeStructure(draft);

    return {
      title: working.name,
      isEditable: draft.isEditable,
      isDirty: JSON.stringify(working) != JSON.stringify(draft.baseStructure),
      canUndo: draft.past.length > 0,
      canRedo: draft.future.length > 0,
      defaultLevelDurationText: String(working.defaultLevelDurationMinutes),
      defaultBreakDurationText: String(working.defaultBreakDurationMinutes),
      rows: working.items.map((_, itemIndex) => createRowSnapshot(working, itemIndex)),
    };
  }
}

export const editorGameKinds = [...GAME_KIND_ORDER];
