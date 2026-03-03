import { useEffect, useMemo, useState } from "react";
import { createContainer } from "@/app/composition/container";
import { TimerSnapshot } from "@/usecases/timer/timerSnapshot";
import TimerBoard from "@/ui/components/TimerBoard";
import BlindsPanel from "@/ui/components/BlindsPanel";
import NextLevelPanel from "@/ui/components/NextLevelPanel";
import MenuButton from "@/ui/components/MenuButton";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatMMSS = (ms: number) => {
  const totalSec = Math.ceil(ms / 1000); // 表示は切り上げ（0秒到達で次へ）
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
};

export default function TimerPage() {
  const container = useMemo(() => createContainer(), []);
  const [snap, setSnap] = useState<TimerSnapshot>(() => container.timerUsecase.getSnapshot());

  // tick loop（UI側）
  useEffect(() => {
    const id = window.setInterval(() => {
      container.timerUsecase.tick();
      setSnap(container.timerUsecase.getSnapshot());
    }, 200);
    return () => window.clearInterval(id);
  }, [container]);

  const onTap = () => {
    container.timerUsecase.toggleStartStop();
    setSnap(container.timerUsecase.getSnapshot());
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[760px] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">{snap.title}</div>
          <MenuButton
            onResetRequested={() => {
              const ok = window.confirm("Resetしますか？（タイマーはIDLEに戻ります）");
              if (!ok) return;
              container.timerUsecase.resetToIdle();
              setSnap(container.timerUsecase.getSnapshot());
            }}
            onNextRequested={() => {
              container.timerUsecase.goToNextLevel();
              setSnap(container.timerUsecase.getSnapshot());
            }}
            onPrevRequested={() => {
              container.timerUsecase.goToPreviousLevel();
              setSnap(container.timerUsecase.getSnapshot());
            }}
          />
        </div>

        <div
          className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm select-none"
          onClick={onTap}
          role="button"
          aria-label="toggle timer start/stop"
        >
          <TimerBoard
            timeText={formatMMSS(snap.remainingMs)}
            status={snap.status}
            levelText={`Level ${snap.levelIndex + 1} / ${snap.levelCount}`}
          />
          <div className="mt-4">
            <BlindsPanel kinds={snap.currentBlinds} />
          </div>
          <div className="mt-4">
            <NextLevelPanel text={snap.nextLevelText} />
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            画面タップで Start/Stop（v1.0） / メニューは仮表示
          </div>
        </div>
      </div>
    </div>
  );
}