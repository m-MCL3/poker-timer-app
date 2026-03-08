export type GameKindId = "fl" | "stud" | "nlpl";
export type BlindSlotId = "sb" | "bb" | "ante";

export type BlindValues = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindsByGame = Record<GameKindId, BlindValues>;

export const GAME_KIND_ORDER: readonly GameKindId[] = ["fl", "stud", "nlpl"];

export const EMPTY_BLINDS: BlindsByGame = {
  fl: { sb: null, bb: null, ante: null },
  stud: { sb: null, bb: null, ante: null },
  nlpl: { sb: null, bb: null, ante: null },
};

export function cloneBlinds(blinds: BlindsByGame): BlindsByGame {
  return {
    fl: { ...blinds.fl },
    stud: { ...blinds.stud },
    nlpl: { ...blinds.nlpl },
  };
}

export function createEmptyBlinds(): BlindsByGame {
  return cloneBlinds(EMPTY_BLINDS);
}

export function normalizeBlindValue(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(0, Math.floor(value));
}

export function formatBlindValue(value: number | null): string {
  if (value === null || value === 0) {
    return "-";
  }
  return String(value);
}

export function gameKindLabel(gameKind: GameKindId): string {
  switch (gameKind) {
    case "fl":
      return "FL";
    case "stud":
      return "STUD";
    case "nlpl":
      return "NL / PL";
  }
}

export function blindSlotLabel(gameKind: GameKindId, slot: BlindSlotId): string {
  if (gameKind === "stud") {
    if (slot === "sb") return "Bring-in";
    if (slot === "bb") return "Complete";
    return "Ante";
  }

  if (slot === "sb") return "SB";
  if (slot === "bb") return "BB";
  return "Ante";
}
