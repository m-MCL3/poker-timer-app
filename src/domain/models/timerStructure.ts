import {
  cloneBlindGroups,
  createDefaultBlindGroups,
  normalizeBlindGroups,
  type BlindGroup,
} from "@/domain/models/blinds";

export type LevelItem = {
  id: string;
  kind: "level";
  name: string;
  durationSec: number;
  blindGroups: BlindGroup[];
};

export type BreakItem = {
  id: string;
  kind: "break";
  name: string;
  durationSec: number;
};

export type TimerItem = LevelItem | BreakItem;

export type TimerStructure = {
  id: string;
  name: string;
  items: TimerItem[];
  defaultLevelDurationSec: number;
  defaultBreakDurationSec: number;
};

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLevelItem(input?: Partial<LevelItem>): LevelItem {
  return {
    id: input?.id ?? createId("lv"),
    kind: "level",
    name: input?.name ?? "",
    durationSec: input?.durationSec ?? 20 * 60,
    blindGroups: normalizeBlindGroups(input?.blindGroups ?? createDefaultBlindGroups()),
  };
}

export function createBreakItem(input?: Partial<BreakItem>): BreakItem {
  return {
    id: input?.id ?? createId("br"),
    kind: "break",
    name: input?.name ?? "",
    durationSec: input?.durationSec ?? 10 * 60,
  };
}

export function cloneTimerItem(item: TimerItem): TimerItem {
  if (item.kind === "break") {
    return { ...item };
  }

  return {
    ...item,
    blindGroups: cloneBlindGroups(item.blindGroups),
  };
}

export function cloneTimerStructure(structure: TimerStructure): TimerStructure {
  return {
    id: structure.id,
    name: structure.name,
    items: structure.items.map(cloneTimerItem),
    defaultLevelDurationSec: structure.defaultLevelDurationSec,
    defaultBreakDurationSec: structure.defaultBreakDurationSec,
  };
}

export function assertTimerStructure(structure: TimerStructure): TimerStructure {
  if (!structure.items.length) {
    throw new Error("TimerStructure.items must not be empty.");
  }

  return structure;
}

export function countLevelsUpToIndex(
  structure: TimerStructure,
  itemIndex: number,
): number {
  let count = 0;
  for (let index = 0; index <= itemIndex; index += 1) {
    if (structure.items[index]?.kind === "level") {
      count += 1;
    }
  }
  return Math.max(count, 1);
}

export function buildDerivedItemName(
  structure: TimerStructure,
  itemIndex: number,
): string {
  const item = structure.items[itemIndex];
  if (!item) {
    return "";
  }
  if (item.kind === "break") {
    return "BREAK";
  }
  return `LEVEL ${countLevelsUpToIndex(structure, itemIndex)}`;
}
