import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

export const sampleTournamentStructure: TournamentStructure = {
  id: "sample",
  title: "Poker Timer (Mock)",
  items: [
    {
      id: "lv-1",
      kind: "level",
      durationMs: 20_000,
      blinds: {
        fl: { sb: 100, bb: 200, ante: 0 },
        stud: { sb: 50, bb: 200, ante: 25 },
        nlpl: { sb: 100, bb: 200, ante: 0 },
      },
    },
    {
      id: "lv-2",
      kind: "level",
      durationMs: 20_000,
      blinds: {
        fl: { sb: 200, bb: 400, ante: 0 },
        stud: { sb: 100, bb: 400, ante: 50 },
        nlpl: { sb: 200, bb: 400, ante: 0 },
      },
    },
    {
      id: "br-1",
      kind: "break",
      durationMs: 10_000,
    },
    {
      id: "lv-3",
      kind: "level",
      durationMs: 20_000,
      blinds: {
        fl: { sb: 400, bb: 800, ante: 50 },
        stud: { sb: 200, bb: 800, ante: 100 },
        nlpl: { sb: 400, bb: 800, ante: 50 },
      },
    },
  ],
  defaultLevelDurationMs: 20 * 60_000,
  defaultBreakDurationMs: 10 * 60_000,
};
