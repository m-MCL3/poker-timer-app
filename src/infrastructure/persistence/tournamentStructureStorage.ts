import type { TournamentStructure } from "@/domain/entities/tournamentStructure";
import type { StoragePort } from "@/usecases/ports/storage";
import {
  deserializeTournamentStructure,
  serializeTournamentStructure,
} from "@/infrastructure/persistence/tournamentStructureSchema";

const INDEX_KEY = "pokerTimer:structures:index";
const ITEM_KEY = (name: string) => `pokerTimer:structures:${name}`;

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export class TournamentStructureStorage {
  constructor(private readonly storage: StoragePort) {}

  async listNames(): Promise<string[]> {
    const raw = await this.storage.load(INDEX_KEY);
    return safeParseStringArray(raw).sort((left, right) =>
      left.localeCompare(right),
    );
  }

  async save(name: string, structure: TournamentStructure): Promise<void> {
    await this.storage.save(ITEM_KEY(name), serializeTournamentStructure(structure));

    const names = await this.listNames();
    const next = Array.from(new Set([...names, name]));
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async load(name: string): Promise<TournamentStructure | null> {
    const raw = await this.storage.load(ITEM_KEY(name));
    if (!raw) {
      return null;
    }

    return deserializeTournamentStructure(raw);
  }

  async remove(name: string): Promise<void> {
    await this.storage.save(ITEM_KEY(name), "");
    const names = (await this.listNames()).filter((item) => item !== name);
    await this.storage.save(INDEX_KEY, JSON.stringify(names));
  }
}
