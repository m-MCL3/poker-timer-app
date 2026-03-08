import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { createAppContainer, type AppContainer } from "@/app/composition/createAppContainer";

const ContainerContext = createContext<AppContainer | null>(null);

export function ContainerProvider({ children }: PropsWithChildren) {
  const container = useMemo(() => createAppContainer(), []);

  useEffect(() => {
    return container.timerHeartbeat.start();
  }, [container]);

  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useAppContainer(): AppContainer {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error("ContainerProvider is missing.");
  }
  return container;
}
