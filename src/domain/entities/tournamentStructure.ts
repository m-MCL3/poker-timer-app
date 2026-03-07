import type { BlindsByGame } from "@/domain/entities/blinds";

export type TournamentStructureItem =
  | {
      id: string;
      kind: "level";
      durationMs: number;
      blinds: BlindsByGame;
    }
  | {
      id: string;
      kind: "break";
      durationMs: number;
    };

export type TournamentStructure = {
  id: string;
  title: string;
  items: TournamentStructureItem[];
  defaultLevelDurationMs: number;
  defaultBreakDurationMs: number;
};

export function cloneTournamentStructure(
  structure: TournamentStructure,
): TournamentStructure {
  return JSON.parse(JSON.stringify(structure)) as TournamentStructure;
}

export function assertTournamentStructure(
  structure: TournamentStructure,
): TournamentStructure {
  if (!structure.items.length) {
    throw new Error("TournamentStructure.items must not be empty.");
  }

  return structure;
}
