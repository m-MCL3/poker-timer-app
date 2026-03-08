import { GAME_KIND_ORDER } from "@/domain/models/blinds";
import {
  createBreakItem,
  createLevelItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";

function createBlindGroups(input: {
  fl: [number | null, number | null, number | null];
  stud: [number | null, number | null, number | null];
  nlpl: [number | null, number | null, number | null];
}) {
  return GAME_KIND_ORDER.map((gameKind) => {
    const source = input[gameKind];
    return {
      gameKind,
      values: {
        sb: source[0],
        bb: source[1],
        ante: source[2],
      },
    };
  });
}

export const sampleTimerStructure: TimerStructure = {
  id: "sample",
  name: "Poker Timer (Mock)",
  items: [
    createLevelItem({
      id: "lv-1",
      durationSec: 20,
      blindGroups: createBlindGroups({
        fl: [100, 200, 0],
        stud: [50, 200, 25],
        nlpl: [100, 200, 0],
      }),
    }),
    createLevelItem({
      id: "lv-2",
      durationSec: 20,
      blindGroups: createBlindGroups({
        fl: [200, 400, 0],
        stud: [100, 400, 50],
        nlpl: [200, 400, 0],
      }),
    }),
    createBreakItem({ id: "br-1", durationSec: 10 }),
    createLevelItem({
      id: "lv-3",
      durationSec: 20,
      blindGroups: createBlindGroups({
        fl: [400, 800, 50],
        stud: [200, 800, 100],
        nlpl: [400, 800, 50],
      }),
    }),
  ],
  defaultLevelDurationSec: 20 * 60,
  defaultBreakDurationSec: 10 * 60,
};
