import type { KeyValueStorage } from "@/application/shared/ports/KeyValueStorage";

export class BrowserKeyValueStorage implements KeyValueStorage {
  async load(key: string): Promise<string | null> {
    return window.localStorage.getItem(key);
  }

  async save(key: string, value: string | null): Promise<void> {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
  }
}
