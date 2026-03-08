import type { KeyValueStore } from "@/usecases/ports/keyValueStore";

export class LocalStorageKeyValueStore implements KeyValueStore {
  async load(key: string): Promise<string | null> {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async save(key: string, value: string | null): Promise<void> {
    try {
      if (value === null || value === "") {
        window.localStorage.removeItem(key);
        return;
      }

      window.localStorage.setItem(key, value);
    } catch {
      // 永続化失敗時は現段階では握りつぶす。
    }
  }
}
