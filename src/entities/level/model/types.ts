export type LevelBlinds = {
  fl: { sb: number; bb: number; ante: number };
  stud: { bringIn: number; complete: number; ante: number };
  nlpl: { sb: number; bb: number; nlAnte: number };
};

export type LevelDef = {
  durationSec: number;
  blinds: LevelBlinds;
};