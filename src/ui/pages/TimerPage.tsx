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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#09090b_55%,#000000_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.36em] text-zinc-500">
              TOURNAMENT TIMER
            </div>
            <h1 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">
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
        </header>

        {snapshot.showBreakBanner ? (
          <section className="mb-5 rounded-[2rem] border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-amber-100 shadow-lg">
            <div className="text-xs tracking-[0.3em] text-amber-300">BREAK TIME</div>
          </section>
        ) : null}

        <div className="grid gap-5">
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

          {snapshot.showCurrentBlinds ? (
            <BlindsPanel blindGroups={snapshot.currentBlindGroups} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
