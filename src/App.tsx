import { Navigate, Route, Routes } from "react-router-dom";
import TimerPage from "@/presentation/pages/TimerPage";
import EditorPage from "@/presentation/pages/EditorPage";
import SettingsPage from "@/presentation/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/timer" replace />} />
      <Route path="/timer" element={<TimerPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
