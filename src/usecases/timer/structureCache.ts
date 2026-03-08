import type { TimerItem, TimerStructure } from "@/domain/models/timerStructure";

export type StructureCache = {
  structureId: string;
  itemDurationsMs: number[];
  prefixDurationMs: number[];
  levelNumbers: number[];
  itemLabels: string[];
  blindTexts: (string | null)[];
  nextBreakIndexByItemIndex: (number | null)[];
  nextItemTextByIndex: string[];
};

function buildBlindText(item: Extract<TimerItem, { kind: "level" }>): string {
  return item.blindGroups
    .map((group) => {
      const sb =
        group.values.sb === null || group.values.sb === 0
          ? "-"
          : String(group.values.sb);
      const bb =
        group.values.bb === null || group.values.bb === 0
          ? "-"
          : String(group.values.bb);
      const ante =
        group.values.ante === null || group.values.ante === 0
          ? "-"
          : String(group.values.ante);

      return `${group.gameKind.toUpperCase()}: ${sb} / ${bb} / ${ante}`;
    })
    .join(" | ");
}

export function buildStructureCache(structure: TimerStructure): StructureCache {
  const itemDurationsMs = structure.items.map((item) => item.durationSec * 1000);

  const prefixDurationMs = [0];
  for (const durationMs of itemDurationsMs) {
    prefixDurationMs.push(prefixDurationMs[prefixDurationMs.length - 1] + durationMs);
  }

  let levelCount = 0;
  const levelNumbers = structure.items.map((item) => {
    if (item.kind === "level") {
      levelCount += 1;
    }
    return Math.max(levelCount, 1);
  });

  const itemLabels = structure.items.map((item, itemIndex) =>
    item.kind === "break" ? "BREAK" : `LEVEL ${levelNumbers[itemIndex]}`,
  );

  const blindTexts = structure.items.map((item) =>
    item.kind === "level" ? buildBlindText(item) : null,
  );

  const nextBreakIndexByItemIndex: (number | null)[] = new Array(structure.items.length).fill(
    null,
  );
  let nextBreakIndex: number | null = null;

  for (let index = structure.items.length - 1; index >= 0; index -= 1) {
    nextBreakIndexByItemIndex[index] = nextBreakIndex;
    if (structure.items[index].kind === "break") {
      nextBreakIndex = index;
      nextBreakIndexByItemIndex[index] = index;
    }
  }

  const nextItemTextByIndex = structure.items.map((_, itemIndex) => {
    const nextItem = structure.items[itemIndex + 1];
    if (!nextItem) {
      return "最終項目です";
    }

    if (nextItem.kind === "break") {
      return "BREAK";
    }

    const nextBlindText = blindTexts[itemIndex + 1] ?? "";
    return `LEVEL ${levelNumbers[itemIndex + 1]} | ${nextBlindText}`;
  });

  return {
    structureId: structure.id,
    itemDurationsMs,
    prefixDurationMs,
    levelNumbers,
    itemLabels,
    blindTexts,
    nextBreakIndexByItemIndex,
    nextItemTextByIndex,
  };
}

export function sumDurationRangeMs(
  cache: StructureCache,
  startInclusive: number,
  endInclusive: number,
): number {
  if (startInclusive > endInclusive) {
    return 0;
  }

  const safeStart = Math.max(0, startInclusive);
  const safeEnd = Math.min(cache.itemDurationsMs.length - 1, endInclusive);

  if (safeStart > safeEnd) {
    return 0;
  }

  return cache.prefixDurationMs[safeEnd + 1] - cache.prefixDurationMs[safeStart];
}
