import { StoragePort } from "@/usecases/ports/storage";

export class NoopStorage implements StoragePort {
  async load(): Promise<string | null> {
    return null;
  }
  async save(): Promise<void> {
    // noop
  }
}