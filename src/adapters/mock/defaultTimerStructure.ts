import { createBreakItem, createLevelItem, type TimerStructure } from "@/domain/models/timerStructure";

export const defaultTimerStructure: TimerStructure = {
  id: "sample",
  name: "Poker Timer (Mock)",
  items: [
    createLevelItem({
      id: "lv-1",
      durationSec: 20,
      blindGroups: [
        { gameKind: "fl", values: { sb: 100, bb: 200, ante: 0 } },
        { gameKind: "stud", values: { sb: 50, bb: 200, ante: 25 } },
        { gameKind: "nlpl", values: { sb: 100, bb: 200, ante: 0 } },
      ],
    }),
    createLevelItem({
      id: "lv-2",
      durationSec: 20,
      blindGroups: [
        { gameKind: "fl", values: { sb: 200, bb: 400, ante: 0 } },
        { gameKind: "stud", values: { sb: 100, bb: 400, ante: 50 } },
        { gameKind: "nlpl", values: { sb: 200, bb: 400, ante: 0 } },
      ],
    }),
    createBreakItem({
      id: "br-1",
      durationSec: 10,
    }),
    createLevelItem({
      id: "lv-3",
      durationSec: 20,
      blindGroups: [
        { gameKind: "fl", values: { sb: 400, bb: 800, ante: 50 } },
        { gameKind: "stud", values: { sb: 200, bb: 800, ante: 100 } },
        { gameKind: "nlpl", values: { sb: 400, bb: 800, ante: 50 } },
      ],
    }),
  ],
  defaultLevelDurationSec: 20 * 60,
  defaultBreakDurationSec: 10 * 60,
};
