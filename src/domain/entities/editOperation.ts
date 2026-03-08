import {
  cloneBlinds,
  EMPTY_BLINDS,
  type BlindSlotId,
  type GameKindId,
} from "@/domain/entities/blinds";
import {
  assertTournamentStructure,
  cloneTournamentStructure,
  createBreakItem,
  createLevelItem,
  normalizeDurationMinutes,
  type TournamentLevelItem,
  type TournamentStructure,
  type TournamentStructureItem,
} from "@/domain/entities/tournamentStructure";

export type EditOperation =
  | { type: "insert-level-after"; itemIndex: number }
  | { type: "insert-break-after"; itemIndex: number }
  | { type: "remove-item"; itemIndex: number }
  | { type: "change-item-kind"; itemIndex: number; kind: "level" | "break" }
  | { type: "set-duration-minutes"; itemIndex: number; minutes: number }
  | {
      type: "set-blind-value";
      itemIndex: number;
      gameKind: GameKindId;
      slot: BlindSlotId;
      value: number | null;
    };

export function createEntityId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function inheritNearestBlinds(
  items: TournamentStructureItem[],
  baseIndex: number,
): TournamentLevelItem["blinds"] {
  for (let index = baseIndex; index >= 0; index -= 1) {
    const item = items[index];
    if (item?.kind === "level") {
      return cloneBlinds(item.blinds);
    }
  }

  for (let index = baseIndex + 1; index < items.length; index += 1) {
    const item = items[index];
    if (item?.kind === "level") {
      return cloneBlinds(item.blinds);
    }
  }

  return cloneBlinds(EMPTY_BLINDS);
}

function normalizeBlindValue(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

export function applyEditOperations(
  structure: TournamentStructure,
  operations: EditOperation[],
): TournamentStructure {
  const next = cloneTournamentStructure(structure);

  for (const operation of operations) {
    const item = next.items[operation.itemIndex];

    switch (operation.type) {
      case "insert-level-after": {
        next.items.splice(
          operation.itemIndex + 1,
          0,
          createLevelItem({
            id: createEntityId("lv"),
            durationMinutes: next.defaultLevelDurationMinutes,
            blinds: inheritNearestBlinds(next.items, operation.itemIndex),
          }),
        );
        break;
      }

      case "insert-break-after": {
        next.items.splice(
          operation.itemIndex + 1,
          0,
          createBreakItem({
            id: createEntityId("br"),
            durationMinutes: next.defaultBreakDurationMinutes,
          }),
        );
        break;
      }

      case "remove-item": {
        if (next.items.length > 1) {
          next.items.splice(operation.itemIndex, 1);
        }
        break;
      }

      case "change-item-kind": {
        if (!item || item.kind === operation.kind) {
          break;
        }

        if (operation.kind === "break") {
          next.items[operation.itemIndex] = createBreakItem({
            id: item.id,
            durationMinutes: item.durationMinutes,
          });
          break;
        }

        next.items[operation.itemIndex] = createLevelItem({
          id: item.id,
          durationMinutes: item.durationMinutes,
          blinds: inheritNearestBlinds(next.items, operation.itemIndex - 1),
        });
        break;
      }

      case "set-duration-minutes": {
        if (item) {
          item.durationMinutes = normalizeDurationMinutes(operation.minutes);
        }
        break;
      }

      case "set-blind-value": {
        if (item?.kind === "level") {
          item.blinds[operation.gameKind][operation.slot] = normalizeBlindValue(
            operation.value,
          );
        }
        break;
      }
    }
  }

  return assertTournamentStructure(next);
}
