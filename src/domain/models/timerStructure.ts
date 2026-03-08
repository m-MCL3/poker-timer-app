import {
  cloneBlindGroups,
  createDefaultBlindGroups,
  ensureBlindGroups,
  type BlindGroup,
} from "@/domain/models/blinds";

export type LevelItem = {
  id: string;
  kind: "level";
  durationSec: number;
  blindGroups: BlindGroup[];
};

export type BreakItem = {
  id: string;
  kind: "break";
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
    ...structure,
    items: structure.items.map(cloneTimerItem),
  };
}

export function assertTimerStructure(structure: TimerStructure): TimerStructure {
  if (!structure.items.length) {
    throw new Error("TimerStructure.items must not be empty.");
  }

  return structure;
}

export function createLevelItem(input: {
  id: string;
  durationSec: number;
  blindGroups?: BlindGroup[];
}): LevelItem {
  return {
    id: input.id,
    kind: "level",
    durationSec: Math.max(0, Math.floor(input.durationSec)),
    blindGroups: ensureBlindGroups(input.blindGroups ?? createDefaultBlindGroups()),
  };
}

export function createBreakItem(input: {
  id: string;
  durationSec: number;
}): BreakItem {
  return {
    id: input.id,
    kind: "break",
    durationSec: Math.max(0, Math.floor(input.durationSec)),
  };
}
