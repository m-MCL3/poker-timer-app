import {
  createBreakItem,
  createLevelItem,
  type TimerStructure,
} from "@/domain/entities/timerStructure";

export const defaultTimerStructure: TimerStructure = {
  id: "default-structure",
  name: "Poker Timer (Mock)",
  defaultLevelDurationMinutes: 20,
  defaultBreakDurationMinutes: 10,
  items: [
    createLevelItem({
      id: "lv-1",
      durationMinutes: 20,
      blinds: {
        fl: { sb: 100, bb: 200, ante: 0 },
        stud: { sb: 50, bb: 200, ante: 25 },
        nlpl: { sb: 100, bb: 200, ante: 0 },
      },
    }),
    createLevelItem({
      id: "lv-2",
      durationMinutes: 20,
      blinds: {
        fl: { sb: 200, bb: 400, ante: 0 },
        stud: { sb: 100, bb: 400, ante: 50 },
        nlpl: { sb: 200, bb: 400, ante: 0 },
      },
    }),
    createBreakItem({
      id: "br-1",
      durationMinutes: 10,
    }),
    createLevelItem({
      id: "lv-3",
      durationMinutes: 20,
      blinds: {
        fl: { sb: 400, bb: 800, ante: 50 },
        stud: { sb: 200, bb: 800, ante: 100 },
        nlpl: { sb: 400, bb: 800, ante: 50 },
      },
    }),
  ],
};
