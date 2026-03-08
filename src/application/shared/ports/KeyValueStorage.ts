export interface KeyValueStorage {
  load(key: string): Promise<string | null>;
  save(key: string, value: string | null): Promise<void>;
}
