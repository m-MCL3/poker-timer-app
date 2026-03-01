import type { ReactNode } from "react";
import { RepositoriesProvider } from "@/app/providers/repositories-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <RepositoriesProvider>{children}</RepositoriesProvider>;
}