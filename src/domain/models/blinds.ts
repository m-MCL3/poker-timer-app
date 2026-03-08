export type GameKindId = "fl" | "stud" | "nlpl";
export type BlindSlotId = "sb" | "bb" | "ante";

export type BlindValues = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindGroup = {
  gameKind: GameKindId;
  values: BlindValues;
};

export const GAME_KIND_ORDER: readonly GameKindId[] = ["fl", "stud", "nlpl"];

export function createEmptyBlindValues(): BlindValues {
  return {
    sb: null,
    bb: null,
    ante: null,
  };
}

export function createDefaultBlindGroups(): BlindGroup[] {
  return GAME_KIND_ORDER.map((gameKind) => ({
    gameKind,
    values: createEmptyBlindValues(),
  }));
}

export function cloneBlindValues(values: BlindValues): BlindValues {
  return {
    sb: values.sb,
    bb: values.bb,
    ante: values.ante,
  };
}

export function cloneBlindGroups(groups: BlindGroup[]): BlindGroup[] {
  return groups.map((group) => ({
    gameKind: group.gameKind,
    values: cloneBlindValues(group.values),
  }));
}

export function findBlindGroup(
  groups: BlindGroup[],
  gameKind: GameKindId,
): BlindGroup | undefined {
  return groups.find((group) => group.gameKind === gameKind);
}

export function ensureBlindGroups(groups: BlindGroup[]): BlindGroup[] {
  return GAME_KIND_ORDER.map((gameKind) => {
    const existing = findBlindGroup(groups, gameKind);
    return {
      gameKind,
      values: existing ? cloneBlindValues(existing.values) : createEmptyBlindValues(),
    };
  });
}

export function formatBlindValue(value: number | null): string {
  if (value === null || value === 0) {
    return "-";
  }
  return String(value);
}
