import type { KeyValueStore } from "@/application/ports/keyValueStore";

export class BrowserKeyValueStore implements KeyValueStore {
  async get(key: string): Promise<string | null> {
    return window.localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    window.localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  }
}
