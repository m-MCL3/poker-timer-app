import {
  ensureBlindGroups,
  type BlindGroup,
  type GameKindId,
} from "@/domain/models/blinds";
import {
  assertTimerStructure,
  createBreakItem,
  createLevelItem,
  type TimerItem,
  type TimerStructure,
} from "@/domain/models/timerStructure";

function isGameKindId(value: string): value is GameKindId {
  return value === "fl" || value === "stud" || value === "nlpl";
}

function deserializeBlindGroups(rawGroups: unknown): BlindGroup[] {
  if (!Array.isArray(rawGroups)) {
    return ensureBlindGroups([]);
  }

  const parsed = rawGroups.flatMap((rawGroup) => {
    if (typeof rawGroup !== "object" || rawGroup === null) {
      return [];
    }

    const group = rawGroup as {
      gameKind?: string;
      values?: { sb?: unknown; bb?: unknown; ante?: unknown };
    };

    if (!group.gameKind || !isGameKindId(group.gameKind)) {
      return [];
    }

    return [
      {
        gameKind: group.gameKind,
        values: {
          sb: typeof group.values?.sb === "number" ? group.values.sb : null,
          bb: typeof group.values?.bb === "number" ? group.values.bb : null,
          ante: typeof group.values?.ante === "number" ? group.values.ante : null,
        },
      },
    ];
  });

  return ensureBlindGroups(parsed);
}

function deserializeItem(rawItem: unknown): TimerItem | null {
  if (typeof rawItem !== "object" || rawItem === null) {
    return null;
  }

  const item = rawItem as {
    id?: unknown;
    kind?: unknown;
    durationSec?: unknown;
    blindGroups?: unknown;
  };

  if (typeof item.id !== "string") {
    return null;
  }

  const durationSec = typeof item.durationSec === "number" ? item.durationSec : 0;

  if (item.kind === "break") {
    return createBreakItem({ id: item.id, durationSec });
  }

  if (item.kind === "level") {
    return createLevelItem({
      id: item.id,
      durationSec,
      blindGroups: deserializeBlindGroups(item.blindGroups),
    });
  }

  return null;
}

export function serializeTimerStructure(structure: TimerStructure): string {
  return JSON.stringify(structure);
}

export function deserializeTimerStructure(raw: string): TimerStructure {
  const parsed = JSON.parse(raw) as {
    id?: unknown;
    name?: unknown;
    title?: unknown;
    items?: unknown;
    defaultLevelDurationSec?: unknown;
    defaultBreakDurationSec?: unknown;
    defaultLevelDurationMs?: unknown;
    defaultBreakDurationMs?: unknown;
  };

  const items = Array.isArray(parsed.items)
    ? parsed.items.map(deserializeItem).filter((item): item is TimerItem => item !== null)
    : [];

  const structure: TimerStructure = {
    id: typeof parsed.id === "string" ? parsed.id : "imported-structure",
    name:
      typeof parsed.name === "string"
        ? parsed.name
        : typeof parsed.title === "string"
          ? parsed.title
          : "Imported Structure",
    items,
    defaultLevelDurationSec:
      typeof parsed.defaultLevelDurationSec === "number"
        ? parsed.defaultLevelDurationSec
        : typeof parsed.defaultLevelDurationMs === "number"
          ? Math.floor(parsed.defaultLevelDurationMs / 1000)
          : 20 * 60,
    defaultBreakDurationSec:
      typeof parsed.defaultBreakDurationSec === "number"
        ? parsed.defaultBreakDurationSec
        : typeof parsed.defaultBreakDurationMs === "number"
          ? Math.floor(parsed.defaultBreakDurationMs / 1000)
          : 10 * 60,
  };

  return assertTimerStructure(structure);
}
