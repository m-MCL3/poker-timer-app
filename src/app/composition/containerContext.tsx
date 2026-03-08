import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from "react";
import { createContainer, type AppContainer } from "@/app/composition/container";

const ContainerContext = createContext<AppContainer | null>(null);

export function ContainerProvider(props: PropsWithChildren) {
  const container = useMemo(() => createContainer(), []);

  useEffect(() => {
    return container.timerController.start();
  }, [container]);

  return (
    <ContainerContext.Provider value={container}>
      {props.children}
    </ContainerContext.Provider>
  );
}

export function useContainer(): AppContainer {
  const value = useContext(ContainerContext);
  if (!value) {
    throw new Error("ContainerProvider is missing.");
  }
  return value;
}
