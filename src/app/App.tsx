import AppProviders from "@/app/providers/app-providers";
import AppRouterProvider from "@/app/router/router-provider";

export default function App() {
  return (
    <AppProviders>
      <AppRouterProvider />
    </AppProviders>
  );
}