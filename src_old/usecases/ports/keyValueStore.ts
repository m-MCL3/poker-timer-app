export interface KeyValueStore {
  load(key: string): Promise<string | null>;
  save(key: string, value: string | null): Promise<void>;
}
