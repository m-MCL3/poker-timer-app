import type {
  TimerPresetRepository,
  TimerPresetSummary,
} from "@/application/ports/timerPresetRepository";
import type { TimerStructure } from "@/domain/entities/timerStructure";

function sortPresetSummaries(summaries: TimerPresetSummary[]): TimerPresetSummary[] {
  return [...summaries].sort((left, right) => {
    if (right.updatedAtEpochMs !== left.updatedAtEpochMs) {
      return right.updatedAtEpochMs - left.updatedAtEpochMs;
    }

    return left.name.localeCompare(right.name, "ja");
  });
}

export class PresetService {
  constructor(private readonly repository: TimerPresetRepository) {}

  normalizeName(name: string): string {
    return name.trim();
  }

  validateName(name: string): string | null {
    const normalized = this.normalizeName(name);
    if (!normalized) {
      return "プリセット名を入力してください。";
    }

    return null;
  }

  hasPreset(summaries: TimerPresetSummary[], name: string): boolean {
    const normalized = this.normalizeName(name);
    return summaries.some((summary) => summary.name === normalized);
  }

  async list(): Promise<TimerPresetSummary[]> {
    return sortPresetSummaries(await this.repository.list());
  }

  async save(name: string, structure: TimerStructure): Promise<void> {
    const normalized = this.normalizeName(name);
    const validationError = this.validateName(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    await this.repository.save(normalized, structure);
  }

  async load(name: string): Promise<TimerStructure | null> {
    return this.repository.load(this.normalizeName(name));
  }

  async rename(currentName: string, nextName: string): Promise<void> {
    const current = this.normalizeName(currentName);
    const next = this.normalizeName(nextName);

    const validationError = this.validateName(next);
    if (validationError) {
      throw new Error(validationError);
    }

    if (current === next) {
      return;
    }

    await this.repository.rename(current, next);
  }

  async delete(name: string): Promise<void> {
    await this.repository.delete(this.normalizeName(name));
  }
}
