import { useCallback, useMemo, useState } from "react";
import type { LevelDef } from "@/entities/level";

type UseLevelControlArgs = {
  levels: LevelDef[];
};

type UseLevelControlReturn = {
  levelIndex: number;
  current: LevelDef;
  next: LevelDef | null;
  // 次レベルへ（末尾なら末尾のまま）
  goNext: () => void;
  // 前レベルへ（先頭なら先頭のまま）※将来メニュー用
  goPrev: () => void;
  // 任意レベルへ（範囲外はクランプ）
  setIndex: (index: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useLevelControl({ levels }: UseLevelControlArgs): UseLevelControlReturn {
  const [levelIndex, setLevelIndex] = useState(0);

  const lastIndex = useMemo(() => Math.max(0, levels.length - 1), [levels.length]);

  const setIndex = useCallback(
    (index: number) => {
      setLevelIndex(clamp(index, 0, lastIndex));
    },
    [lastIndex]
  );

  const goNext = useCallback(() => {
    setLevelIndex((i) => Math.min(i + 1, lastIndex));
  }, [lastIndex]);

  const goPrev = useCallback(() => {
    setLevelIndex((i) => Math.max(i - 1, 0));
  }, []);

  const current = levels[levelIndex] ?? levels[0];
  const next = levelIndex + 1 <= lastIndex ? levels[levelIndex + 1] : null;

  return { levelIndex, current, next, goNext, goPrev, setIndex };
}