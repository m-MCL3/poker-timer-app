import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createContainer, type AppContainer } from "@/app/composition/container";

const ContainerContext = createContext<AppContainer | null>(null);

export function ContainerProvider(props: { children: ReactNode }) {
  const container = useMemo(() => createContainer(), []);
  return (
    <ContainerContext.Provider value={container}>
      {props.children}
    </ContainerContext.Provider>
  );
}

export function useContainer(): AppContainer {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error("ContainerProvider is missing.");
  }
  return container;
}
