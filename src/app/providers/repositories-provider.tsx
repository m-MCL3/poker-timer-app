import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LevelRepository } from "@/entities/level/api/level-repository";
import type { LevelDef } from "@/entities/level";
import { LocalStorageLevelRepository } from "@/infrastructure/storage/local-storage-level-repository";

type Repositories = {
  levelRepository: LevelRepository;
};

const RepositoriesContext = createContext<Repositories | null>(null);

export function RepositoriesProvider({ children }: { children: ReactNode }) {
  const repos = useMemo<Repositories>(() => {
    return {
      levelRepository: new LocalStorageLevelRepository(),
    };
  }, []);

  // ✅ 共有 levels state（ここが“Reactの真実”）
  const [levels, setLevels] = useState<LevelDef[]>(() => repos.levelRepository.getLevels());

  return (
    <RepositoriesContext.Provider value={repos}>
      <LevelsContext.Provider value={{ levels, setLevels }}>
        {children}
      </LevelsContext.Provider>
    </RepositoriesContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const ctx = useContext(RepositoriesContext);
  if (!ctx) throw new Error("useRepositories must be used within RepositoriesProvider");
  return ctx;
}

/** ✅ 追加：levels共有のContext */
type LevelsState = {
  levels: LevelDef[];
  setLevels: (levels: LevelDef[]) => void;
};

const LevelsContext = createContext<LevelsState | null>(null);

export function useLevels(): LevelsState {
  const ctx = useContext(LevelsContext);
  if (!ctx) throw new Error("useLevels must be used within RepositoriesProvider");
  return ctx;
}