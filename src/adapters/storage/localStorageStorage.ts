import type { StoragePort } from "@/usecases/ports/storage";

/**
 * LocalStorage backed storage port.
 * 将来: Server/IndexedDB 等に差し替え可能にするため Port 経由にしておく。
 */
export class LocalStorageStorage implements StoragePort {
  async load(key: string): Promise<string | null> {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async save(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // 容量超過など。現段階では握りつぶし（必要なら ErrorNotifier 等へ）
    }
  }
}