import { useEffect, useState } from "react";
import { useContainer } from "@/app/composition/containerContext";
import BlindsPanel from "@/ui/components/BlindsPanel";
import MenuButton from "@/ui/components/MenuButton";
import NextItemPanel from "@/ui/components/NextItemPanel";
import TimerBoard from "@/ui/components/TimerBoard";
import type { TimerSnapshot } from "@/usecases/timer/timerSnapshot";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatMMSS(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function formatNextBreakText(snapshot: TimerSnapshot): string {
  if (snapshot.nextBreakRemainingMs === null) {
    return "NO BREAK";
  }
  if (snapshot.nextBreakRemainingMs === 0) {
    return "NOW";
  }
  return formatMMSS(snapshot.nextBreakRemainingMs);
}

export default function TimerPage() {
  const { timerUsecase } = useContainer();
  const [snapshot, setSnapshot] = useState(() => timerUsecase.getSnapshot());

  useEffect(() => {
    setSnapshot(timerUsecase.getSnapshot());

    const unsubscribe = timerUsecase.subscribe(() => {
      setSnapshot(timerUsecase.getSnapshot());
    });

    const stopAutoTick = timerUsecase.startAutoTick(250);

    return () => {
      stopAutoTick();
      unsubscribe();
    };
  }, [timerUsecase]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.3em] text-slate-400">
            TOURNAMENT TIMER
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {snapshot.title}
          </h1>
        </div>

        <MenuButton
          onResetRequested={() => {
            if (!confirm("Resetして idle に戻します。よろしいですか？")) {
              return;
            }
            timerUsecase.reset();
          }}
          onNextRequested={() => timerUsecase.goToNextItem()}
          onPrevRequested={() => timerUsecase.goToPreviousItem()}
        />
      </div>

      {snapshot.showBreakBanner && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold tracking-[0.2em] text-amber-200">
          BREAK TIME
        </div>
      )}

      <TimerBoard
        status={snapshot.status}
        currentItemNumber={snapshot.currentItemNumber}
        totalItemCount={snapshot.totalItemCount}
        currentItemLabel={snapshot.currentItemLabel}
        remainingText={formatMMSS(snapshot.remainingMs)}
        onToggleRequested={() => timerUsecase.toggle()}
      />

      <NextItemPanel
        nextItemText={snapshot.nextItemText}
        nextBreakText={formatNextBreakText(snapshot)}
      />

      {snapshot.showCurrentBlinds && (
        <BlindsPanel blindGroups={snapshot.currentBlindGroups} />
      )}
    </div>
  );
}
