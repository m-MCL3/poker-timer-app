import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContainer } from "@/app/composition/containerContext";

export function useTimerPageModel() {
  const navigate = useNavigate();
  const { timerSessionService } = useContainer();
  const [snapshot, setSnapshot] = useState(() => timerSessionService.getSnapshot());

  useEffect(() => {
    setSnapshot(timerSessionService.getSnapshot());

    return timerSessionService.subscribe(() => {
      setSnapshot(timerSessionService.getSnapshot());
    });
  }, [timerSessionService]);

  return useMemo(
    () => ({
      snapshot,
      onToggle: () => timerSessionService.toggle(),
      onReset: () => {
        const accepted = window.confirm("Resetして idle に戻します。よろしいですか？");
        if (!accepted) {
          return;
        }

        timerSessionService.reset();
      },
      onPrev: () => timerSessionService.goToPreviousItem(),
      onNext: () => timerSessionService.goToNextItem(),
      onOpenEditor: () => navigate("/editor"),
      onOpenSettings: () => navigate("/settings"),
    }),
    [navigate, snapshot, timerSessionService],
  );
}
