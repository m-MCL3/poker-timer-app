import type { TimerStatus } from "@/domain/entities/timer";

type Props = {
  status: TimerStatus;

  levelIndex: number;
  levelCount: number;

  remainingText: string;

  onTap: () => void;
};

const statusLabel = (s: TimerStatus) => {
  if (s === "idle") return "IDLE";
  if (s === "running") return "RUNNING";
  if (s === "paused") return "PAUSED";
  return "FINISHED";
};

export default function TimerBoard(props: Props) {
  const { status, levelIndex, levelCount, remainingText, onTap } = props;

  const levelText = `Level ${levelIndex + 1} / ${levelCount}`;

  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-6 text-left active:scale-[0.995]"
      onClick={onTap}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">{levelText}</div>
        <div className="text-xs text-zinc-300">{statusLabel(status)}</div>
      </div>

      <div className="mt-2 text-5xl font-semibold tracking-wide">{remainingText}</div>

      <div className="mt-3 text-xs text-zinc-500">Tap to Start/Stop</div>
    </button>
  );
}