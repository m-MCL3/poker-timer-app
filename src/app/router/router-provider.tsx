import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function AppRouterProvider() {
  return <RouterProvider router={router} />;
}