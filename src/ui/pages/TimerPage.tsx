import { useEffect, useState } from "react";

import type { TimerSnapshot } from "@/usecases/timer/timerSnapshot";
import { useContainer } from "@/app/composition/containerContext";

import TimerBoard from "@/ui/components/TimerBoard";
import BlindsPanel from "@/ui/components/BlindsPanel";
import NextLevelPanel from "@/ui/components/NextLevelPanel";
import MenuButton from "@/ui/components/MenuButton";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatMMSS = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
};

export default function TimerPage() {
  const { timerUsecase } = useContainer();

  // ✅ 型を明示して「snapが別型になる」事故を防ぐ
  const [snap, setSnap] = useState<TimerSnapshot>(() => timerUsecase.getSnapshot());

  useEffect(() => {
    const id = window.setInterval(() => {
      timerUsecase.tick();
      setSnap(timerUsecase.getSnapshot());
    }, 250);

    return () => window.clearInterval(id);
  }, [timerUsecase]);

  const onTapBoard = () => {
    timerUsecase.toggleStartStop();
    setSnap(timerUsecase.getSnapshot());
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[760px] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-400">{snap.title}</div>

          <MenuButton
            onResetRequested={() => {
              if (!confirm("Resetして idle に戻します。よろしいですか？")) return;
              timerUsecase.resetToIdle();
              setSnap(timerUsecase.getSnapshot());
            }}
            onNextRequested={() => {
              timerUsecase.goToNextLevel();
              setSnap(timerUsecase.getSnapshot());
            }}
            onPrevRequested={() => {
              timerUsecase.goToPreviousLevel();
              setSnap(timerUsecase.getSnapshot());
            }}
          />
        </div>

        <div className="mt-4">
          <TimerBoard
            status={snap.status}
            levelIndex={snap.levelIndex}
            levelCount={snap.levelCount}
            remainingText={formatMMSS(snap.remainingMs)}
            onTap={onTapBoard}
          />
        </div>

        <div className="mt-4">
          <BlindsPanel blinds={snap.currentBlinds} />
        </div>

        <div className="mt-4">
          <NextLevelPanel text={snap.nextLevelText} />
        </div>
      </div>
    </div>
  );
}