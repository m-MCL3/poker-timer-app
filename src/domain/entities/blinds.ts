export type GameKindId = "fl" | "stud" | "nlpl";
export type BlindSlotId = "sb" | "bb" | "ante";

export type BlindTriple = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindsByGame = Record<GameKindId, BlindTriple>;

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

export function gameKindLabel(gameKind: GameKindId): string {
  switch (gameKind) {
    case "fl":
      return "FL";
    case "stud":
      return "STUD";
    default:
      return "NL / PL";
  }
}

export function blindSlotLabels(gameKind: GameKindId): {
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

export function formatBlindValue(value: number | null): string {
  if (value === null || value === 0) {
    return "-";
  }

  return String(value);
}
