import type { StoragePort } from "@/usecases/ports/storage";

export class LocalStorageStorage implements StoragePort {
  async load(key: string): Promise<string | null> {
    const value = window.localStorage.getItem(key);
    return value === null || value === "" ? null : value;
  }

  async save(key: string, value: string): Promise<void> {
    if (value === "") {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
  }
}
