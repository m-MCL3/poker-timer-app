export type StructurePresetSummary = {
  name: string;
  updatedAtEpochMs: number;
};

export function sortPresetSummaries(
  presets: StructurePresetSummary[],
): StructurePresetSummary[] {
  return [...presets].sort((left, right) => {
    if (left.updatedAtEpochMs !== right.updatedAtEpochMs) {
      return right.updatedAtEpochMs - left.updatedAtEpochMs;
    }

    return left.name.localeCompare(right.name, "ja");
  });
}
