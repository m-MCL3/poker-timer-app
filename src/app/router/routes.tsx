import { createBrowserRouter } from "react-router-dom";
import TimerPage from "@/pages/timer/timer-page";
import EditorPage from "@/pages/editor/editor-page";
import SettingsPage from "@/pages/settings/settings-page";

export const router = createBrowserRouter([
  { path: "/", element: <TimerPage /> },
  { path: "/editor", element: <EditorPage /> },
  { path: "/settings", element: <SettingsPage /> },
]);