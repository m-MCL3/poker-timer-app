export type GameKind = "fl" | "stud" | "nlpl";
export type BlindSlot = "sb" | "bb" | "ante";

export type BlindValues = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindsByGame = Record<GameKind, BlindValues>;

export const GAME_KIND_ORDER: readonly GameKind[] = ["fl", "stud", "nlpl"];

export function createEmptyBlinds(): BlindsByGame {
  return {
    fl: { sb: null, bb: null, ante: null },
    stud: { sb: null, bb: null, ante: null },
    nlpl: { sb: null, bb: null, ante: null },
  };
}

export function cloneBlinds(blinds: BlindsByGame): BlindsByGame {
  return {
    fl: { ...blinds.fl },
    stud: { ...blinds.stud },
    nlpl: { ...blinds.nlpl },
  };
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

export function gameKindLabel(gameKind: GameKind): string {
  switch (gameKind) {
    case "fl":
      return "FL";
    case "stud":
      return "STUD";
    case "nlpl":
      return "NL / PL";
  }
}

export function blindSlotLabels(gameKind: GameKind): Record<BlindSlot, string> {
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
