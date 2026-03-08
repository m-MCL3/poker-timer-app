import {
  cloneBlinds,
  createEmptyBlinds,
  normalizeBlindValue,
  type BlindsByGame,
} from "@/domain/entities/blinds";

export type TimerStructureItemKind = "level" | "break";

export type LevelItem = {
  id: string;
  kind: "level";
  durationMinutes: number;
  blinds: BlindsByGame;
};

export type BreakItem = {
  id: string;
  kind: "break";
  durationMinutes: number;
};

export type TimerStructureItem = LevelItem | BreakItem;

export type TimerStructure = {
  id: string;
  name: string;
  defaultLevelDurationMinutes: number;
  defaultBreakDurationMinutes: number;
  items: TimerStructureItem[];
};

export function normalizeDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export function createLevelItem(input: {
  id: string;
  durationMinutes: number;
  blinds?: BlindsByGame;
}): LevelItem {
  const sourceBlinds = input.blinds ?? createEmptyBlinds();

  return {
    id: input.id,
    kind: "level",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
    blinds: {
      fl: {
        sb: normalizeBlindValue(sourceBlinds.fl.sb),
        bb: normalizeBlindValue(sourceBlinds.fl.bb),
        ante: normalizeBlindValue(sourceBlinds.fl.ante),
      },
      stud: {
        sb: normalizeBlindValue(sourceBlinds.stud.sb),
        bb: normalizeBlindValue(sourceBlinds.stud.bb),
        ante: normalizeBlindValue(sourceBlinds.stud.ante),
      },
      nlpl: {
        sb: normalizeBlindValue(sourceBlinds.nlpl.sb),
        bb: normalizeBlindValue(sourceBlinds.nlpl.bb),
        ante: normalizeBlindValue(sourceBlinds.nlpl.ante),
      },
    },
  };
}

export function createBreakItem(input: {
  id: string;
  durationMinutes: number;
}): BreakItem {
  return {
    id: input.id,
    kind: "break",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
  };
}

export function cloneStructure(structure: TimerStructure): TimerStructure {
  return {
    id: structure.id,
    name: structure.name.trim(),
    defaultLevelDurationMinutes: normalizeDurationMinutes(
      structure.defaultLevelDurationMinutes,
    ),
    defaultBreakDurationMinutes: normalizeDurationMinutes(
      structure.defaultBreakDurationMinutes,
    ),
    items: structure.items.map((item) => {
      if (item.kind === "break") {
        return createBreakItem({
          id: item.id,
          durationMinutes: item.durationMinutes,
        });
      }

      return createLevelItem({
        id: item.id,
        durationMinutes: item.durationMinutes,
        blinds: cloneBlinds(item.blinds),
      });
    }),
  };
}

export function itemDurationMs(item: TimerStructureItem): number {
  return normalizeDurationMinutes(item.durationMinutes) * 60_000;
}

export function buildItemLabel(
  structure: TimerStructure,
  itemIndex: number,
): string {
  let levelCount = 0;
  let breakCount = 0;

  for (let index = 0; index <= itemIndex; index += 1) {
    const item = structure.items[index];
    if (!item) {
      break;
    }

    if (item.kind === "level") {
      levelCount += 1;
      if (index === itemIndex) {
        return `LEVEL ${levelCount}`;
      }
      continue;
    }

    breakCount += 1;
    if (index === itemIndex) {
      return `BREAK ${breakCount}`;
    }
  }

  return `ITEM ${itemIndex + 1}`;
}

export function assertStructure(structure: TimerStructure): TimerStructure {
  const normalized = cloneStructure(structure);

  if (!normalized.name) {
    throw new Error("構造名を入力してください。");
  }

  if (normalized.items.length === 0) {
    throw new Error("少なくとも1つの項目が必要です。");
  }

  return normalized;
}
