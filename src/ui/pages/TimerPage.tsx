import { useEffect, useMemo, useState } from "react";
import { useContainer } from "@/app/composition/containerContext";
import type { TimerState } from "@/domain/entities/timerState";
import {
  createTimerSnapshot,
  goToNextItem,
  goToPreviousItem,
  resetTimer,
  tickTimer,
  toggleTimer,
} from "@/usecases/timer/timerUsecase";
import TimerBoard from "@/ui/components/TimerBoard";
import BlindsPanel from "@/ui/components/BlindsPanel";
import NextLevelPanel from "@/ui/components/NextLevelPanel";
import MenuButton from "@/ui/components/MenuButton";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatMMSS(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export default function TimerPage() {
  const { clock, timerStore } = useContainer();
  const [timerState, setTimerState] = useState<TimerState>(() =>
    timerStore.getState(),
  );
  const [nowEpochMs, setNowEpochMs] = useState<number>(() => clock.nowEpochMs());

  useEffect(() => {
    return timerStore.subscribe(() => {
      setTimerState(timerStore.getState());
    });
  }, [timerStore]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = clock.nowEpochMs();
      setNowEpochMs(now);

      timerStore.setState(
        tickTimer({
          state: timerStore.getState(),
          nowEpochMs: now,
        }),
      );
    }, 250);

    return () => window.clearInterval(id);
  }, [clock, timerStore]);

  const snapshot = useMemo(
    () =>
      createTimerSnapshot({
        state: timerState,
        nowEpochMs,
      }),
    [nowEpochMs, timerState],
  );

  const isBreak = snapshot.currentItemKind === "break";

  return (
    <div className="mx-auto flex min-h-screen max-w-[760px] flex-col gap-4 px-4 py-6 text-zinc-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{snapshot.title}</h1>
          <p className="text-sm text-zinc-400">{snapshot.currentItemOrderText}</p>
          <p className="text-sm text-zinc-300">{snapshot.currentItemLabel}</p>
        </div>
        <MenuButton
          onResetRequested={() => {
            if (!confirm("Resetして idle に戻します。よろしいですか？")) {
              return;
            }
            timerStore.setState(resetTimer(timerStore.getState()));
          }}
          onNextRequested={() =>
            timerStore.setState(
              goToNextItem({
                state: timerStore.getState(),
                nowEpochMs: clock.nowEpochMs(),
              }),
            )
          }
          onPrevRequested={() =>
            timerStore.setState(
              goToPreviousItem({
                state: timerStore.getState(),
                nowEpochMs: clock.nowEpochMs(),
              }),
            )
          }
        />
      </div>

      {isBreak && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold tracking-[0.2em] text-amber-100">
          BREAK TIME
        </div>
      )}

      <TimerBoard
        status={snapshot.status}
        levelIndex={snapshot.currentItemIndex}
        levelCount={snapshot.totalItemCount}
        remainingText={formatMMSS(snapshot.remainingMs)}
        onTap={() =>
          timerStore.setState(
            toggleTimer({
              state: timerStore.getState(),
              nowEpochMs: clock.nowEpochMs(),
            }),
          )
        }
      />

      {!isBreak && <BlindsPanel blinds={snapshot.currentDisplayBlinds} />}
      <NextLevelPanel text={snapshot.nextItemText} />
    </div>
  );
}
