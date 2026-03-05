import React, { createContext, useContext, useMemo } from "react";
import { createContainer, type AppContainer } from "@/app/composition/container";

const Ctx = createContext<AppContainer | null>(null);

export function ContainerProvider(props: { children: React.ReactNode }) {
  // StrictModeでも「Providerが生きてる限り」共有される
  const container = useMemo(() => createContainer(), []);
  return <Ctx.Provider value={container}>{props.children}</Ctx.Provider>;
}

export function useContainer(): AppContainer {
  const v = useContext(Ctx);
  if (!v) throw new Error("ContainerProvider is missing.");
  return v;
}