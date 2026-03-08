import type { PresetSummary } from "@/domain/models/preset";
import type { TimerStructure } from "@/domain/models/timerStructure";
import { sortPresetSummaries } from "@/domain/models/preset";
import {
  deserializeTimerStructure,
  serializeTimerStructure,
} from "@/infrastructure/persistence/timerStructureSchema";
import type { PresetRepository } from "@/usecases/ports/presetRepository";
import type { StoragePort } from "@/usecases/ports/storage";

type StoredPresetIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:structures:index";

function itemKey(name: string): string {
  return `pokerTimer:structures:${name}`;
}

function safeParseIndex(raw: string | null): PresetSummary[] {
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

export class TimerPresetRepository implements PresetRepository {
  constructor(private readonly storage: StoragePort) {}

  async listPresets(): Promise<PresetSummary[]> {
    return safeParseIndex(await this.storage.load(INDEX_KEY));
  }

  async savePreset(name: string, structure: TimerStructure): Promise<void> {
    const updatedAtEpochMs = Date.now();
    await this.storage.save(itemKey(name), serializeTimerStructure(structure));

    const current = await this.listPresets();
    const next = sortPresetSummaries([
      ...current.filter((preset) => preset.name !== name),
      { name, updatedAtEpochMs },
    ]);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }

  async loadPreset(name: string): Promise<TimerStructure | null> {
    const raw = await this.storage.load(itemKey(name));
    if (!raw) {
      return null;
    }
    return deserializeTimerStructure(raw);
  }

  async renamePreset(currentName: string, nextName: string): Promise<void> {
    const raw = await this.storage.load(itemKey(currentName));
    if (!raw) {
      throw new Error("変更元のプリセットが見つかりません。");
    }

    await this.storage.save(itemKey(nextName), raw);
    await this.storage.save(itemKey(currentName), "");

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
    await this.storage.save(itemKey(name), "");
    const next = (await this.listPresets()).filter((preset) => preset.name !== name);
    await this.storage.save(INDEX_KEY, JSON.stringify(next));
  }
}
