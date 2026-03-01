import { useEffect, useState } from "react";
import { useRepositories } from "@/app/providers/repositories-provider";
import type { LevelDef } from "@/entities/level";

export function useLevelsState() {
  const { levelRepository } = useRepositories();

  const [levels, setLevels] = useState<LevelDef[]>(() =>
    levelRepository.getLevels()
  );

  // 保存時に明示的に再読込するAPI
  const reload = () => {
    setLevels(levelRepository.getLevels());
  };

  return { levels, reload };
}