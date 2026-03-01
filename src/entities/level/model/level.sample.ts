import type { LevelDef } from "./types";

export const SAMPLE_LEVELS: LevelDef[] = [
  {
    durationSec: 15 * 60,
    blinds: {
      fl: { sb: 200, bb: 500, ante: 0 },
      stud: { bringIn: 200, complete: 500, ante: 100 },
      nlpl: { sb: 100, bb: 200, nlAnte: 300 },
    },
  },
  {
    durationSec: 15 * 60,
    blinds: {
      fl: { sb: 300, bb: 600, ante: 0 },
      stud: { bringIn: 300, complete: 600, ante: 100 },
      nlpl: { sb: 200, bb: 400, nlAnte: 600 },
    },
  },
];