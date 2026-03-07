export type GameKindId = "fl" | "stud" | "nlpl";
export type BlindSlotId = "sb" | "bb" | "ante";

export type BlindTriple = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindsByGame = Record<GameKindId, BlindTriple>;

export type BlindLabels = {
  left: string;
  mid: string;
  right: string;
};

export const GAME_KIND_ORDER: GameKindId[] = ["fl", "stud", "nlpl"];

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

export function labelsFor(kind: GameKindId): BlindLabels {
  if (kind === "stud") {
    return { left: "Bring-in", mid: "Complete", right: "Ante" };
  }

  return { left: "SB", mid: "BB", right: "Ante" };
}

export function formatBlindValue(value: number | null): string {
  if (value === null || value === 0) {
    return "-";
  }

  return String(value);
}
