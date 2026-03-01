import TimerBoard from "@/widgets/timer-board";
import BlindsPanel from "@/widgets/blinds-panel";
import NextLevelPanel from "@/widgets/next-level-panel";
import TopMenu from "@/widgets/top-menu";

import { useTimerControl } from "@/features/timer-control";
import { useLevelControl } from "@/features/level-control";

import { formatNextLevel } from "@/entities/blinds";
import { useRepositories } from "@/app/providers/repositories-provider";
import { useLevelsState } from "@/features/levels-state/use-levels-state";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimerPage() {
  const { levelRepository } = useRepositories();
  const { levels } = useLevelsState();

  const { levelIndex, current, next, goNext, goPrev, setIndex } =
    useLevelControl({ levels });

  const { timeLeft, showPause, toggleRunning, reset } = useTimerControl({
    durationSec: current.durationSec,
    onExpire: goNext,
  });

  const nextText = next ? formatNextLevel(next.blinds) : null;

  return (
    <div
      onClick={toggleRunning}
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#e6edf3",
        padding: 16,
      }}
    >
      <TopMenu
        onToggleRunning={toggleRunning}
        onReset={() => {
          setIndex(0);
          reset();
        }}
        onNextLevel={goNext}
        onPrevLevel={goPrev}
      />

      <div style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 28 }}>
          トーナメント名称
        </div>

        <div style={{ textAlign: "center", fontWeight: 700, opacity: 0.8 }}>
          Level {levelIndex + 1}
        </div>

        <TimerBoard timeText={formatTime(timeLeft)} showPause={showPause} />

        <BlindsPanel
          fl={current.blinds.fl}
          stud={current.blinds.stud}
          nlpl={current.blinds.nlpl}
        />

        <NextLevelPanel next={nextText} />
      </div>
    </div>
  );
}