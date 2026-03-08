import {
  normalizeBlindGroups,
  type BlindGroup,
} from "@/domain/models/blinds";
import {
  assertTimerStructure,
  cloneTimerStructure,
  createBreakItem,
  createLevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";

type StoredBlindGroup = {
  gameKind: "fl" | "stud" | "nlpl";
  values: {
    sb: number | null;
    bb: number | null;
    ante: number | null;
  };
};

type StoredTimerItem =
  | {
      id: string;
      kind: "level";
      name: string;
      durationSec: number;
      blindGroups: StoredBlindGroup[];
    }
  | {
      id: string;
      kind: "break";
      name: string;
      durationSec: number;
    };

type StoredTimerStructureV1 = {
  schemaVersion: 1;
  structure: {
    id: string;
    name: string;
    items: StoredTimerItem[];
    defaultLevelDurationSec: number;
    defaultBreakDurationSec: number;
  };
};

function toStoredItem(item: TimerItem): StoredTimerItem {
  if (item.kind === "break") {
    return {
      id: item.id,
      kind: "break",
      name: item.name,
      durationSec: item.durationSec,
    };
  }

  return {
    id: item.id,
    kind: "level",
    name: item.name,
    durationSec: item.durationSec,
    blindGroups: item.blindGroups.map((group) => ({
      gameKind: group.gameKind,
      values: { ...group.values },
    })),
  };
}

export function serializeTimerStructure(structure: TimerStructure): string {
  const safe = cloneTimerStructure(assertTimerStructure(structure));
  const stored: StoredTimerStructureV1 = {
    schemaVersion: 1,
    structure: {
      id: safe.id,
      name: safe.name,
      items: safe.items.map(toStoredItem),
      defaultLevelDurationSec: safe.defaultLevelDurationSec,
      defaultBreakDurationSec: safe.defaultBreakDurationSec,
    },
  };
  return JSON.stringify(stored);
}

function normalizeBlindGroupsForLevel(
  groups: StoredBlindGroup[] | undefined,
): BlindGroup[] {
  return normalizeBlindGroups(
    Array.isArray(groups)
      ? groups.map((group) => ({
          gameKind: group.gameKind,
          values: {
            sb: group.values?.sb ?? null,
            bb: group.values?.bb ?? null,
            ante: group.values?.ante ?? null,
          },
        }))
      : [],
  );
}

export function deserializeTimerStructure(raw: string): TimerStructure {
  const parsed = JSON.parse(raw) as StoredTimerStructureV1;
  if (!parsed || parsed.schemaVersion !== 1) {
    throw new Error("Unsupported preset schema.");
  }

  const structure: TimerStructure = {
    id: parsed.structure.id,
    name: parsed.structure.name,
    items: parsed.structure.items.map((item) => {
      if (item.kind === "break") {
        return createBreakItem({
          id: item.id,
          name: item.name,
          durationSec: item.durationSec,
        });
      }

      return createLevelItem({
        id: item.id,
        name: item.name,
        durationSec: item.durationSec,
        blindGroups: normalizeBlindGroupsForLevel(item.blindGroups),
      });
    }),
    defaultLevelDurationSec: parsed.structure.defaultLevelDurationSec,
    defaultBreakDurationSec: parsed.structure.defaultBreakDurationSec,
  };

  return assertTimerStructure(structure);
}
