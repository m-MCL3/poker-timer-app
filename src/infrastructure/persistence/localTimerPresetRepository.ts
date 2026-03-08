import type {
  TimerPresetRepository,
  TimerPresetSummary,
} from "@/application/ports/timerPresetRepository";
import type { KeyValueStore } from "@/application/ports/keyValueStore";
import {
  assertStructure,
  cloneStructure,
  type TimerStructure,
} from "@/domain/entities/timerStructure";

type StoredPresetIndexItem = {
  name: string;
  updatedAtEpochMs: number;
};

const INDEX_KEY = "pokerTimer:presets:index";

function presetKey(name: string): string {
  return `pokerTimer:presets:${name}`;
}

function safeParseIndex(raw: string | null): TimerPresetSummary[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
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
  } catch {
    return [];
  }
}

function serializeStructure(structure: TimerStructure): string {
  return JSON.stringify(assertStructure(structure));
}

function deserializeStructure(raw: string): TimerStructure {
  return assertStructure(JSON.parse(raw) as TimerStructure);
}

export class LocalTimerPresetRepository implements TimerPresetRepository {
  constructor(private readonly store: KeyValueStore) {}

  async list(): Promise<TimerPresetSummary[]> {
    return safeParseIndex(await this.store.get(INDEX_KEY));
  }

  async save(name: string, structure: TimerStructure): Promise<void> {
    const updatedAtEpochMs = Date.now();
    await this.store.set(presetKey(name), serializeStructure(cloneStructure(structure)));

    const current = await this.list();
    const next = [
      ...current.filter((item) => item.name !== name),
      { name, updatedAtEpochMs },
    ];

    await this.store.set(INDEX_KEY, JSON.stringify(next));
  }

  async load(name: string): Promise<TimerStructure | null> {
    const raw = await this.store.get(presetKey(name));
    if (!raw) {
      return null;
    }

    return deserializeStructure(raw);
  }

  async rename(currentName: string, nextName: string): Promise<void> {
    const raw = await this.store.get(presetKey(currentName));
    if (!raw) {
      throw new Error("変更元のプリセットが見つかりません。");
    }

    await this.store.set(presetKey(nextName), raw);
    await this.store.remove(presetKey(currentName));

    const current = await this.list();
    const currentItem = current.find((item) => item.name === currentName);
    const next = [
      ...current.filter((item) => item.name !== currentName),
      {
        name: nextName,
        updatedAtEpochMs: currentItem?.updatedAtEpochMs ?? Date.now(),
      },
    ];

    await this.store.set(INDEX_KEY, JSON.stringify(next));
  }

  async delete(name: string): Promise<void> {
    await this.store.remove(presetKey(name));

    const next = (await this.list()).filter((item) => item.name !== name);
    await this.store.set(INDEX_KEY, JSON.stringify(next));
  }
}
