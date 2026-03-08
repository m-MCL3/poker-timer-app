import { createBreakItem, createLevelItem, type TournamentStructure } from "@/domain/tournamentStructure";

export function createDefaultStructure(): TournamentStructure {
  return {
    id: "default-structure",
    name: "Standard Mix",
    defaultLevelDurationMinutes: 15,
    defaultBreakDurationMinutes: 5,
    items: [
      createLevelItem({
        id: "level-1",
        durationMinutes: 15,
        blinds: {
          fl: { sb: 100, bb: 200, ante: 0 },
          stud: { sb: 25, bb: 100, ante: 25 },
          nlpl: { sb: 100, bb: 200, ante: 0 },
        },
      }),
      createLevelItem({
        id: "level-2",
        durationMinutes: 15,
        blinds: {
          fl: { sb: 200, bb: 400, ante: 0 },
          stud: { sb: 50, bb: 200, ante: 50 },
          nlpl: { sb: 200, bb: 400, ante: 0 },
        },
      }),
      createBreakItem({ id: "break-1", durationMinutes: 5 }),
      createLevelItem({
        id: "level-3",
        durationMinutes: 15,
        blinds: {
          fl: { sb: 300, bb: 600, ante: 0 },
          stud: { sb: 75, bb: 300, ante: 75 },
          nlpl: { sb: 300, bb: 600, ante: 0 },
        },
      }),
      createLevelItem({
        id: "level-4",
        durationMinutes: 15,
        blinds: {
          fl: { sb: 400, bb: 800, ante: 0 },
          stud: { sb: 100, bb: 400, ante: 100 },
          nlpl: { sb: 400, bb: 800, ante: 0 },
        },
      }),
    ],
  };
}
