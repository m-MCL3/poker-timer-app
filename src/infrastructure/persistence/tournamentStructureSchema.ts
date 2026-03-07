import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

type LegacyBlindStructureV1 = {
  schemaVersion: 1;
  structure: {
    levels: Array<{
      durationSec: number;
      blinds: {
        fl: { sb: number; bb: number; ante: number };
        stud: { bringIn: number; complete: number; ante: number };
        nlpl: { sb: number; bb: number; nlAnte: number };
      };
    }>;
  };
};

type StoredTournamentStructureV2 = {
  schemaVersion: 2;
  structure: TournamentStructure;
};

type LegacyTimerDefinition = {
  id: string;
  title: string;
  entries: Array<
    | {
        id: string;
        kind: "level";
        durationMs: number;
        blinds: {
          fl: { sb: number | null; bb: number | null; ante: number | null };
          stud: { sb: number | null; bb: number | null; ante: number | null };
          nlpl: { sb: number | null; bb: number | null; ante: number | null };
        };
      }
    | {
        id: string;
        kind: "break";
        durationMs: number;
      }
  >;
  defaultLevelDurationMs: number;
  defaultBreakDurationMs: number;
};

export const TOURNAMENT_STRUCTURE_SCHEMA_VERSION = 2;

export function serializeTournamentStructure(
  structure: TournamentStructure,
): string {
  const payload: StoredTournamentStructureV2 = {
    schemaVersion: TOURNAMENT_STRUCTURE_SCHEMA_VERSION,
    structure,
  };

  return JSON.stringify(payload);
}

export function deserializeTournamentStructure(raw: string): TournamentStructure {
  const parsed = JSON.parse(raw) as
    | StoredTournamentStructureV2
    | LegacyBlindStructureV1
    | LegacyTimerDefinition;

  return migrateTournamentStructure(parsed);
}

export function migrateTournamentStructure(
  value: StoredTournamentStructureV2 | LegacyBlindStructureV1 | LegacyTimerDefinition,
): TournamentStructure {
  if ("schemaVersion" in value && value.schemaVersion === 2) {
    return value.structure;
  }

  if ("schemaVersion" in value && value.schemaVersion === 1) {
    return {
      id: "migrated-v1",
      title: "Migrated Structure",
      items: value.structure.levels.map((level, index) => ({
        id: `lv-${index + 1}`,
        kind: "level" as const,
        durationMs: level.durationSec * 1000,
        blinds: {
          fl: {
            sb: level.blinds.fl.sb,
            bb: level.blinds.fl.bb,
            ante: level.blinds.fl.ante,
          },
          stud: {
            sb: level.blinds.stud.bringIn,
            bb: level.blinds.stud.complete,
            ante: level.blinds.stud.ante,
          },
          nlpl: {
            sb: level.blinds.nlpl.sb,
            bb: level.blinds.nlpl.bb,
            ante: level.blinds.nlpl.nlAnte,
          },
        },
      })),
      defaultLevelDurationMs: 20 * 60_000,
      defaultBreakDurationMs: 10 * 60_000,
    };
  }

  return {
    id: value.id,
    title: value.title,
    items: value.entries,
    defaultLevelDurationMs: value.defaultLevelDurationMs,
    defaultBreakDurationMs: value.defaultBreakDurationMs,
  };
}
