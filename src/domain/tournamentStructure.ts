import {
  cloneBlinds,
  createEmptyBlinds,
  normalizeBlindValue,
  type BlindsByGame,
  type GameKindId,
} from "@/domain/blinds";

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

export type StructureItem = LevelItem | BreakItem;

export type TournamentStructure = {
  id: string;
  name: string;
  defaultLevelDurationMinutes: number;
  defaultBreakDurationMinutes: number;
  items: StructureItem[];
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
  const source = input.blinds ?? createEmptyBlinds();
  const normalized = cloneBlinds(source);

  for (const gameKind of Object.keys(normalized) as GameKindId[]) {
    normalized[gameKind] = {
      sb: normalizeBlindValue(normalized[gameKind].sb),
      bb: normalizeBlindValue(normalized[gameKind].bb),
      ante: normalizeBlindValue(normalized[gameKind].ante),
    };
  }

  return {
    id: input.id,
    kind: "level",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
    blinds: normalized,
  };
}

export function createBreakItem(input: { id: string; durationMinutes: number }): BreakItem {
  return {
    id: input.id,
    kind: "break",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
  };
}

export function cloneStructure(structure: TournamentStructure): TournamentStructure {
  return {
    id: structure.id,
    name: structure.name,
    defaultLevelDurationMinutes: normalizeDurationMinutes(structure.defaultLevelDurationMinutes),
    defaultBreakDurationMinutes: normalizeDurationMinutes(structure.defaultBreakDurationMinutes),
    items: structure.items.map((item) =>
      item.kind === "break"
        ? createBreakItem({ id: item.id, durationMinutes: item.durationMinutes })
        : createLevelItem({
            id: item.id,
            durationMinutes: item.durationMinutes,
            blinds: item.blinds,
          }),
    ),
  };
}

export function assertStructure(structure: TournamentStructure): TournamentStructure {
  const normalized = cloneStructure(structure);
  if (!normalized.name.trim()) {
    throw new Error("構造名が空です。");
  }
  if (normalized.items.length === 0) {
    throw new Error("少なくとも1つの項目が必要です。");
  }
  return normalized;
}

export function itemDurationMs(item: StructureItem): number {
  return normalizeDurationMinutes(item.durationMinutes) * 60_000;
}

export function buildItemLabel(structure: TournamentStructure, itemIndex: number): string {
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
