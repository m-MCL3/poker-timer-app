import type { StructurePresetSummary } from "@/domain/preset";
import { sortPresetSummaries } from "@/domain/preset";
import { assertStructure, cloneStructure, type TournamentStructure } from "@/domain/tournamentStructure";
import type { KeyValueStorage } from "@/application/shared/ports/KeyValueStorage";
import type { StructurePresetRepository } from "@/application/shared/ports/StructurePresetRepository";

type StoredIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:structures:index:v2";

function itemKey(name: string): string {
  return `pokerTimer:structures:${name}:v2`;
}

function safeParseIndex(raw: string | null): StructurePresetSummary[] {
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
        typeof (item as StoredIndexItem).name === "string" &&
        typeof (item as StoredIndexItem).updatedAtEpochMs === "number"
      ) {
        return [
          {
            name: (item as StoredIndexItem).name,
            updatedAtEpochMs: (item as StoredIndexItem).updatedAtEpochMs,
          },
        ];
      }
      return [];
    });

    return sortPresetSummaries(normalized);
  } catch {
    return [];
  }
}

export class LocalStorageStructurePresetRepository implements StructurePresetRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async listPresets(): Promise<StructurePresetSummary[]> {
    return safeParseIndex(await this.storage.load(INDEX_KEY));
  }

  async savePreset(name: string, structure: TournamentStructure): Promise<void> {
    const normalized = assertStructure(cloneStructure(structure));
    const updatedAtEpochMs = Date.now();
    await this.storage.save(itemKey(name), JSON.stringify(normalized));

    const current = await this.listPresets();
    const next = sortPresetSummaries([
      ...current.filter((preset) => preset.name !== name),
      { name, updatedAtEpochMs },
    ]);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async loadPreset(name: string): Promise<TournamentStructure | null> {
    const raw = await this.storage.load(itemKey(name));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as TournamentStructure;
    return assertStructure(parsed);
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    const raw = await this.storage.load(itemKey(currentName));
    if (!raw) {
      throw new Error("変更元のプリセットが見つかりません。");
    }

    await this.storage.save(itemKey(nextName), raw);
    await this.storage.save(itemKey(currentName), null);

    const current = await this.listPresets();
    const currentItem = current.find((preset) => preset.name === currentName);
    const next = sortPresetSummaries([
      ...current.filter((preset) => preset.name !== currentName),
      { name: nextName, updatedAtEpochMs: currentItem?.updatedAtEpochMs ?? Date.now() },
    ]);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async deletePreset(name: string): Promise<void> {
    await this.storage.save(itemKey(name), null);
    const next = (await this.listPresets()).filter((preset) => preset.name !== name);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }
}
