export type StructurePresetSummary = {
  name: string;
  updatedAtEpochMs: number;
};

export function sortPresetSummaries(items: StructurePresetSummary[]): StructurePresetSummary[] {
  return [...items].sort((left, right) => {
    if (right.updatedAtEpochMs !== left.updatedAtEpochMs) {
      return right.updatedAtEpochMs - left.updatedAtEpochMs;
    }
    return left.name.localeCompare(right.name, "ja");
  });
}
