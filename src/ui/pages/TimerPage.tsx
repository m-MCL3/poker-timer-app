import { useEffect, useState } from "react";
import { useContainer } from "@/app/composition/containerContext";
import BlindsPanel from "@/ui/components/BlindsPanel";
import MenuButton from "@/ui/components/MenuButton";
import NextItemPanel from "@/ui/components/NextItemPanel";
import TimerBoard from "@/ui/components/TimerBoard";

export default function TimerPage() {
  const { timerUsecase } = useContainer();
  const [snapshot, setSnapshot] = useState(() => timerUsecase.getSnapshot());

  useEffect(() => {
    setSnapshot(timerUsecase.getSnapshot());
    return timerUsecase.subscribe(() => {
      setSnapshot(timerUsecase.getSnapshot());
    });
  }, [timerUsecase]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-cyan-200/70">TOURNAMENT TIMER</div>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
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

        <div className="grid gap-6">
          {snapshot.showBreakBanner ? (
            <section className="rounded-[1.75rem] border border-amber-400/30 bg-amber-500/10 px-6 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="text-xs tracking-[0.35em] text-amber-200/80">BREAK TIME</div>
              <div className="mt-2 text-3xl font-semibold text-amber-50">休憩中です</div>
            </section>
          ) : null}

          <TimerBoard
            status={snapshot.status}
            currentItemNumber={snapshot.currentItemNumber}
            totalItemCount={snapshot.totalItemCount}
            currentItemLabel={snapshot.currentItemLabel}
            remainingText={snapshot.remainingText}
            progressPercent={snapshot.progressPercent}
            onToggleRequested={() => timerUsecase.toggle()}
          />

          {snapshot.showCurrentBlinds ? (
            <BlindsPanel blindGroups={snapshot.currentBlindGroups} />
          ) : null}

          <NextItemPanel
            nextItemText={snapshot.nextItemText}
            nextBreakText={snapshot.nextBreakText}
          />
        </div>
      </div>
    </main>
  );
}
