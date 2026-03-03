export type GameKindId = "fl" | "stud" | "nlpl";

/**
 * 3スロット固定（キーは常に sb/bb/ante）
 * - FL   : SB / BB / Ante
 * - STUD : Bring-in / Complete / Ante（ただしキーは sb/bb/ante のまま）
 * - NLPL : SB / BB / Ante（ただしPLなどでAnte無しは null）
 */
export type BlindTriple = {
  sb: number | null;
  bb: number | null;
  ante: number | null;
};

export type BlindsByGame = Record<GameKindId, BlindTriple>;

export const GAME_KIND_ORDER: GameKindId[] = ["fl", "stud", "nlpl"];