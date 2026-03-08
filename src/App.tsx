import { Navigate, Route, Routes } from "react-router-dom";
import TimerPage from "@/ui/pages/TimerPage";
import EditorPage from "@/ui/pages/EditorPage";
import SettingsPage from "@/ui/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TimerPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
