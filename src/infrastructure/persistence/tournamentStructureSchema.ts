import type { TournamentStructure } from "@/domain/entities/tournamentStructure";

export type StoredTournamentStructureV1 = {
  schemaVersion: 1;
  structure: TournamentStructure;
};

export const TOURNAMENT_STRUCTURE_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function serializeTournamentStructure(
  structure: TournamentStructure,
): string {
  const payload: StoredTournamentStructureV1 = {
    schemaVersion: TOURNAMENT_STRUCTURE_SCHEMA_VERSION,
    structure,
  };

  return JSON.stringify(payload);
}

export function deserializeTournamentStructure(raw: string): TournamentStructure {
  const value = JSON.parse(raw) as unknown;

  if (!isRecord(value)) {
    throw new Error("Invalid structure payload.");
  }

  if (value.schemaVersion !== TOURNAMENT_STRUCTURE_SCHEMA_VERSION) {
    throw new Error("Unsupported structure payload.");
  }

  if (!("structure" in value)) {
    throw new Error("Structure field is missing.");
  }

  return (value as StoredTournamentStructureV1).structure;
}
