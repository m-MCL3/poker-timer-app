import { cloneBlinds, EMPTY_BLINDS, type BlindsByGame } from "@/domain/entities/blinds";

export type TournamentLevelItem = {
  id: string;
  kind: "level";
  durationMinutes: number;
  blinds: BlindsByGame;
};

export type TournamentBreakItem = {
  id: string;
  kind: "break";
  durationMinutes: number;
};

export type TournamentStructureItem = TournamentLevelItem | TournamentBreakItem;

export type TournamentStructure = {
  id: string;
  name: string;
  defaultLevelDurationMinutes: number;
  defaultBreakDurationMinutes: number;
  items: TournamentStructureItem[];
};

export function createLevelItem(input: {
  id: string;
  durationMinutes: number;
  blinds?: BlindsByGame;
}): TournamentLevelItem {
  return {
    id: input.id,
    kind: "level",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
    blinds: cloneBlinds(input.blinds ?? EMPTY_BLINDS),
  };
}

export function createBreakItem(input: {
  id: string;
  durationMinutes: number;
}): TournamentBreakItem {
  return {
    id: input.id,
    kind: "break",
    durationMinutes: normalizeDurationMinutes(input.durationMinutes),
  };
}

export function cloneTournamentStructure(
  structure: TournamentStructure,
): TournamentStructure {
  return {
    id: structure.id,
    name: structure.name,
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
        blinds: item.blinds,
      });
    }),
  };
}

export function assertTournamentStructure(
  structure: TournamentStructure,
): TournamentStructure {
  const normalized = cloneTournamentStructure(structure);

  if (!normalized.name.trim()) {
    throw new Error("構造名が空です。");
  }

  if (normalized.items.length === 0) {
    throw new Error("少なくとも1つの項目が必要です。");
  }

  return normalized;
}

export function buildDerivedItemName(
  structure: TournamentStructure,
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

export function itemDurationMs(item: TournamentStructureItem): number {
  return normalizeDurationMinutes(item.durationMinutes) * 60_000;
}

export function normalizeDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}
