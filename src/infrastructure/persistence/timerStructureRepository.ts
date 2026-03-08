import type { StructurePresetSummary } from "@/domain/models/preset";
import type { TimerStructure } from "@/domain/models/timerStructure";
import { sortPresetSummaries } from "@/domain/models/preset";
import {
  deserializeTimerStructure,
  serializeTimerStructure,
} from "@/infrastructure/persistence/timerStructureSchema";
import type { KeyValueStore } from "@/usecases/ports/keyValueStore";
import type { TimerStructurePresetRepository } from "@/usecases/ports/timerStructurePresetRepository";

type StoredPresetIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:structures:index";
const itemKey = (name: string) => `pokerTimer:structures:${name}`;

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
        return [item as StoredPresetIndexItem];
      }

      if (typeof item === "string") {
        return [{ name: item, updatedAtEpochMs: 0 }];
      }

      return [];
    });

    return sortPresetSummaries(presets);
  } catch {
    return [];
  }
}

export class TimerStructureRepository implements TimerStructurePresetRepository {
  constructor(
    private readonly storage: KeyValueStore,
    private readonly nowEpochMs: () => number = () => Date.now(),
  ) {}

  async listPresets(): Promise<StructurePresetSummary[]> {
    const raw = await this.storage.load(INDEX_KEY);
    return safeParsePresetIndex(raw);
  }

  async savePreset(name: string, structure: TimerStructure): Promise<void> {
    const updatedAtEpochMs = this.nowEpochMs();
    await this.storage.save(itemKey(name), serializeTimerStructure(structure));

    const nextPresets = sortPresetSummaries([
      ...(await this.listPresets()).filter((preset) => preset.name !== name),
      { name, updatedAtEpochMs },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
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
    await this.storage.save(itemKey(currentName), null);

    const currentPresets = await this.listPresets();
    const currentPreset = currentPresets.find((preset) => preset.name === currentName);
    const nextPresets = sortPresetSummaries([
      ...currentPresets.filter((preset) => preset.name !== currentName),
      {
        name: nextName,
        updatedAtEpochMs: currentPreset?.updatedAtEpochMs ?? this.nowEpochMs(),
      },
    ]);

    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
  }

  async deletePreset(name: string): Promise<void> {
    await this.storage.save(itemKey(name), null);
    const nextPresets = (await this.listPresets()).filter((preset) => preset.name !== name);
    await this.storage.save(INDEX_KEY, JSON.stringify(nextPresets));
  }
}
