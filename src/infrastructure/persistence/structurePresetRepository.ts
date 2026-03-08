import {
  sortPresetSummaries,
  type StructurePresetSummary,
} from "@/domain/entities/structurePreset";
import type { TournamentStructure } from "@/domain/entities/tournamentStructure";
import {
  deserializeTournamentStructure,
  serializeTournamentStructure,
} from "@/infrastructure/persistence/tournamentStructureSchema";
import type { StructurePresetRepository } from "@/usecases/ports/structurePresetRepository";
import type { StoragePort } from "@/usecases/ports/storage";

type StoredPresetIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:structures:index";

function presetKey(name: string): string {
  return `pokerTimer:structures:${name}`;
}

function safeParsePresetIndex(raw: string | null): StructurePresetSummary[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed.flatMap((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredPresetIndexItem).name === "string" &&
        typeof (item as StoredPresetIndexItem).updatedAtEpochMs === "number"
      ) {
        return [
          {
            name: (item as StoredPresetIndexItem).name,
            updatedAtEpochMs: (item as StoredPresetIndexItem).updatedAtEpochMs,
          },
        ];
      }

      if (typeof item === "string") {
        return [{ name: item, updatedAtEpochMs: 0 }];
      }

      return [];
    });

    return sortPresetSummaries(normalized);
  } catch {
    return [];
  }
}

export class LocalStructurePresetRepository implements StructurePresetRepository {
  constructor(private readonly storage: StoragePort) {}

  async listPresets(): Promise<StructurePresetSummary[]> {
    return safeParsePresetIndex(await this.storage.load(INDEX_KEY));
  }

  async savePreset(name: string, structure: TournamentStructure): Promise<void> {
    const updatedAtEpochMs = Date.now();
    await this.storage.save(presetKey(name), serializeTournamentStructure(structure));

    const current = await this.listPresets();
    const next = sortPresetSummaries([
      ...current.filter((preset) => preset.name !== name),
      { name, updatedAtEpochMs },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async loadPreset(name: string): Promise<TournamentStructure | null> {
    const raw = await this.storage.load(presetKey(name));
    if (!raw) {
      return null;
    }

    return deserializeTournamentStructure(raw);
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    const raw = await this.storage.load(presetKey(currentName));
    if (!raw) {
      throw new Error("変更元のプリセットが見つかりません。");
    }

    await this.storage.save(presetKey(nextName), raw);
    await this.storage.save(presetKey(currentName), "");

    const current = await this.listPresets();
    const currentItem = current.find((preset) => preset.name === currentName);
    const next = sortPresetSummaries([
      ...current.filter((preset) => preset.name !== currentName),
      {
        name: nextName,
        updatedAtEpochMs: currentItem?.updatedAtEpochMs ?? Date.now(),
      },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async deletePreset(name: string): Promise<void> {
    await this.storage.save(presetKey(name), "");
    const next = (await this.listPresets()).filter((preset) => preset.name !== name);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }
}
