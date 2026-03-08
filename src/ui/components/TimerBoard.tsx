import type { TimerStatus } from "@/domain/entities/timerState";

type Props = {
  status: TimerStatus;
  currentItemNumber: number;
  totalItemCount: number;
  currentItemLabel: string;
  remainingText: string;
  onToggleRequested: () => void;
};

function statusLabel(status: TimerStatus): string {
  if (status === "idle") {
    return "IDLE";
  }

  if (status === "running") {
    return "RUNNING";
  }

  if (status === "paused") {
    return "PAUSED";
  }

  return "FINISHED";
}

export default function TimerBoard(props: Props) {
  return (
    <button
      type="button"
      onClick={props.onToggleRequested}
      className="w-full rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-left shadow-lg backdrop-blur transition hover:bg-white/10"
    >
      <div className="text-xs font-semibold tracking-[0.3em] text-slate-400">
        ITEM {props.currentItemNumber} / {props.totalItemCount}
      </div>

      <div className="mt-4 text-3xl font-semibold text-white">
        {props.currentItemLabel}
      </div>

      <div className="mt-2 text-sm font-medium tracking-[0.2em] text-cyan-300">
        {statusLabel(props.status)}
      </div>

      <div className="mt-6 text-6xl font-semibold tabular-nums text-white">
        {props.remainingText}
      </div>

      <div className="mt-4 text-sm text-slate-400">
        画面タップでスタート / 一時停止
      </div>
    </button>
  );
}
