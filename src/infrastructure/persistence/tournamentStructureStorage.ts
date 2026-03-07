import type { StructurePresetSummary } from "@/domain/entities/structurePreset";
import type { TournamentStructure } from "@/domain/entities/tournamentStructure";
import type { StoragePort } from "@/usecases/ports/storage";
import {
  deserializeTournamentStructure,
  serializeTournamentStructure,
} from "@/infrastructure/persistence/tournamentStructureSchema";
import { buildPresetSummaries } from "@/usecases/preset/presetUsecase";

type StoredPresetIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:structures:index";
const ITEM_KEY = (name: string) => `pokerTimer:structures:${name}`;

function safeParsePresetIndex(raw: string | null): StructurePresetSummary[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const presets = parsed.flatMap((item) => {
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

    return buildPresetSummaries(presets);
  } catch {
    return [];
  }
}

export class TournamentStructureStorage {
  constructor(private readonly storage: StoragePort) {}

  async listPresets(): Promise<StructurePresetSummary[]> {
    const raw = await this.storage.load(INDEX_KEY);
    return safeParsePresetIndex(raw);
  }

  async listNames(): Promise<string[]> {
    return (await this.listPresets()).map((preset) => preset.name);
  }

  async has(name: string): Promise<boolean> {
    return (await this.listNames()).includes(name);
  }

  async savePreset(name: string, structure: TournamentStructure): Promise<void> {
    const updatedAtEpochMs = Date.now();

    await this.storage.save(
      ITEM_KEY(name),
      serializeTournamentStructure(structure),
    );

    const currentPresets = await this.listPresets();
    const nextPresets = buildPresetSummaries([
      ...currentPresets.filter((preset) => preset.name !== name),
      { name, updatedAtEpochMs },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
  }

  async save(name: string, structure: TournamentStructure): Promise<void> {
    await this.savePreset(name, structure);
  }

  async loadPreset(name: string): Promise<TournamentStructure | null> {
    const raw = await this.storage.load(ITEM_KEY(name));
    if (!raw) {
      return null;
    }

    return deserializeTournamentStructure(raw);
  }

  async load(name: string): Promise<TournamentStructure | null> {
    return this.loadPreset(name);
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    const raw = await this.storage.load(ITEM_KEY(currentName));
    if (!raw) {
      throw new Error("変更元のプリセットが見つかりません。");
    }

    const currentPresets = await this.listPresets();
    const currentPreset = currentPresets.find(
      (preset) => preset.name === currentName,
    );
    const updatedAtEpochMs = Date.now();

    await this.storage.save(ITEM_KEY(nextName), raw);
    await this.storage.save(ITEM_KEY(currentName), "");

    const nextPresets = buildPresetSummaries([
      ...currentPresets.filter((preset) => preset.name !== currentName),
      {
        name: nextName,
        updatedAtEpochMs: currentPreset?.updatedAtEpochMs ?? updatedAtEpochMs,
      },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
  }

  async deletePreset(name: string): Promise<void> {
    await this.storage.save(ITEM_KEY(name), "");

    const nextPresets = (await this.listPresets()).filter(
      (preset) => preset.name !== name,
    );

    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
  }

  async remove(name: string): Promise<void> {
    await this.deletePreset(name);
  }
}
