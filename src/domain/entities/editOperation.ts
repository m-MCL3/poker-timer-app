import type {
  TournamentStructure,
  TournamentStructureItem,
} from "@/domain/entities/tournamentStructure";
import {
  EMPTY_BLINDS,
  cloneBlinds,
  type BlindSlotId,
  type GameKindId,
} from "@/domain/entities/blinds";
import {
  assertTournamentStructure,
  cloneTournamentStructure,
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

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createLevel(durationMs: number): TournamentStructureItem {
  return {
    id: newId("lv"),
    kind: "level",
    durationMs,
    blinds: cloneBlinds(EMPTY_BLINDS),
  };
}

function createBreak(durationMs: number): TournamentStructureItem {
  return {
    id: newId("br"),
    kind: "break",
    durationMs,
  };
}

function findNearestLevelBlinds(
  items: TournamentStructureItem[],
  baseIndex: number,
) {
  for (let i = baseIndex; i >= 0; i -= 1) {
    const item = items[i];
    if (item.kind === "level") {
      return cloneBlinds(item.blinds);
    }
  }

  for (let i = baseIndex + 1; i < items.length; i += 1) {
    const item = items[i];
    if (item.kind === "level") {
      return cloneBlinds(item.blinds);
    }
  }

  return cloneBlinds(EMPTY_BLINDS);
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
          createLevel(next.defaultLevelDurationMs),
        );
        break;
      }

      case "insert-break-after": {
        next.items.splice(
          operation.itemIndex + 1,
          0,
          createBreak(next.defaultBreakDurationMs),
        );
        break;
      }

      case "remove-item": {
        if (next.items.length <= 1) {
          break;
        }
        next.items.splice(operation.itemIndex, 1);
        break;
      }

      case "change-item-kind": {
        if (!item || item.kind === operation.kind) {
          break;
        }

        if (operation.kind === "break") {
          next.items[operation.itemIndex] = {
            id: item.id,
            kind: "break",
            durationMs: item.durationMs,
          };
          break;
        }

        next.items[operation.itemIndex] = {
          id: item.id,
          kind: "level",
          durationMs: item.durationMs,
          blinds: findNearestLevelBlinds(next.items, operation.itemIndex - 1),
        };
        break;
      }

      case "set-duration-minutes": {
        if (!item) {
          break;
        }
        item.durationMs = Math.max(0, Math.floor(operation.minutes)) * 60_000;
        break;
      }

      case "set-blind-value": {
        if (!item || item.kind !== "level") {
          break;
        }

        item.blinds[operation.gameKind][operation.slot] = operation.value;
        break;
      }
    }
  }

  return assertTournamentStructure(next);
}
