import { TimerDefinition } from "@/domain/entities/timer";
import { BlindsByGame } from "@/domain/entities/blinds";

// ---- 仕様書にある形（モック入力） ----
type RawLevel = {
  durationSec: number;
  blinds: {
    fl: { sb: number; bb: number; ante: number };
    stud: { bringIn: number; complete: number; ante: number };
    nlpl: { sb: number; bb: number; nlAnte: number };
  };
};

const normalize = (raw: RawLevel): { durationMs: number; blinds: BlindsByGame } => {
  const b: BlindsByGame = {
    fl: { sb: raw.blinds.fl.sb, bb: raw.blinds.fl.bb, ante: raw.blinds.fl.ante },
    // STUDはキーを sb/bb/ante に寄せる（UIラベルで Bring-in/Complete 表示）
    stud: { sb: raw.blinds.stud.bringIn, bb: raw.blinds.stud.complete, ante: raw.blinds.stud.ante },
    // NLPLの nlAnte も ante スロットへ寄せる（UIラベルは Ante のまま）
    nlpl: { sb: raw.blinds.nlpl.sb, bb: raw.blinds.nlpl.bb, ante: raw.blinds.nlpl.nlAnte },
  };

  return { durationMs: raw.durationSec * 1000, blinds: b };
};

// ---- 適当な仮データ（後で差し替え前提） ----
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

export const sampleTimerDefinition: TimerDefinition = {
  id: "sample",
  title: "Poker Timer (Mock)",
  levels: RAW_LEVELS.map((r) => normalize(r)),
};