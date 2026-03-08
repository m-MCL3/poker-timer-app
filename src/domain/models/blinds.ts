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

export const GAME_KIND_ORDER: GameKindId[] = ["fl", "stud", "nlpl"];

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
  return { ...values };
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

export function upsertBlindValue(
  groups: BlindGroup[],
  gameKind: GameKindId,
  slot: BlindSlotId,
  value: number | null,
): BlindGroup[] {
  const next = cloneBlindGroups(groups);
  const target = findBlindGroup(next, gameKind);
  if (target) {
    target.values[slot] = value;
    return next;
  }
  next.push({
    gameKind,
    values: {
      ...createEmptyBlindValues(),
      [slot]: value,
    },
  });
  return normalizeBlindGroups(next);
}

export function normalizeBlindGroups(groups: BlindGroup[]): BlindGroup[] {
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

export function labelsForGameKind(gameKind: GameKindId): {
  sb: string;
  bb: string;
  ante: string;
} {
  if (gameKind === "stud") {
    return {
      sb: "Bring-in",
      bb: "Complete",
      ante: "Ante",
    };
  }

  return {
    sb: "SB",
    bb: "BB",
    ante: "Ante",
  };
}

export function gameKindLabel(gameKind: GameKindId): string {
  if (gameKind === "fl") {
    return "FL";
  }
  if (gameKind === "stud") {
    return "STUD";
  }
  return "NL / PL";
}
