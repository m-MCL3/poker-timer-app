import type { TimerDefinition, TimerEntry } from "@/domain/entities/timer";
import type { BlindsByGame } from "@/domain/entities/blinds";

type RawLevel = {
  durationSec: number;
  blinds: {
    fl: { sb: number; bb: number; ante: number };
    stud: { bringIn: number; complete: number; ante: number };
    nlpl: { sb: number; bb: number; nlAnte: number };
  };
};

const normalizeBlinds = (raw: RawLevel["blinds"]): BlindsByGame => ({
  fl: { sb: raw.fl.sb, bb: raw.fl.bb, ante: raw.fl.ante },
  stud: { sb: raw.stud.bringIn, bb: raw.stud.complete, ante: raw.stud.ante },
  nlpl: { sb: raw.nlpl.sb, bb: raw.nlpl.bb, ante: raw.nlpl.nlAnte },
});

const newId = (prefix: string, i: number) => `${prefix}-${i}`;

const RAW_LEVELS: RawLevel[] = [
  {
    durationSec: 20,
    blinds: {
      fl: { sb: 100, bb: 200, ante: 0 },
      stud: { bringIn: 50, complete: 200, ante: 25 },
      nlpl: { sb: 100, bb: 200, nlAnte: 0 },
    },
  },
  {
    durationSec: 20,
    blinds: {
      fl: { sb: 200, bb: 400, ante: 0 },
      stud: { bringIn: 100, complete: 400, ante: 50 },
      nlpl: { sb: 200, bb: 400, nlAnte: 0 },
    },
  },
  {
    durationSec: 20,
    blinds: {
      fl: { sb: 400, bb: 800, ante: 50 },
      stud: { bringIn: 200, complete: 800, ante: 100 },
      nlpl: { sb: 400, bb: 800, nlAnte: 50 },
    },
  },
];

const entries: TimerEntry[] = RAW_LEVELS.map((r, i) => ({
  id: newId("lv", i + 1),
  kind: "level",
  durationMs: r.durationSec * 1000,
  blinds: normalizeBlinds(r.blinds),
}));

export const sampleTimerDefinition: TimerDefinition = {
  id: "sample",
  title: "Poker Timer (Mock)",
  entries,
  defaultLevelDurationMs: 20 * 60_000,
  defaultBreakDurationMs: 10 * 60_000,
};