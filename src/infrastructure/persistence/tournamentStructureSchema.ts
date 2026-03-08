import {
  assertTournamentStructure,
  cloneTournamentStructure,
  type TournamentStructure,
} from "@/domain/entities/tournamentStructure";

export function serializeTournamentStructure(
  structure: TournamentStructure,
): string {
  return JSON.stringify(cloneTournamentStructure(assertTournamentStructure(structure)));
}

export function deserializeTournamentStructure(
  raw: string,
): TournamentStructure {
  return assertTournamentStructure(JSON.parse(raw) as TournamentStructure);
}
