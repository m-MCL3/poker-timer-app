import type { TimerStatus } from "@/domain/entities/timerState";

type Props = {
  status: TimerStatus;
  currentItemNumber: number;
  totalItemCount: number;
  currentItemLabel: string;
  remainingText: string;
  progressPercent: number;
  onToggleRequested: () => void;
};

function statusLabel(status: TimerStatus): string {
  switch (status) {
    case "idle":
      return "IDLE";
    case "running":
      return "RUNNING";
    case "paused":
      return "PAUSED";
    case "finished":
      return "FINISHED";
  }
}

export default function TimerBoard(props: Props) {
  return (
    <button
      type="button"
      onClick={props.onToggleRequested}
      className="w-full rounded-[2rem] border border-cyan-500/20 bg-zinc-950/70 px-6 py-8 text-left shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition hover:border-cyan-400/50 hover:bg-zinc-950/90"
    >
      <div className="flex items-center justify-between gap-4 text-xs tracking-[0.35em] text-cyan-200/80">
        <span>{statusLabel(props.status)}</span>
        <span>
          ITEM {props.currentItemNumber} / {props.totalItemCount}
        </span>
      </div>

      <div className="mt-4 text-sm font-medium text-zinc-400">{props.currentItemLabel}</div>
      <div className="mt-2 text-7xl font-semibold tabular-nums text-white sm:text-8xl">
        {props.remainingText}
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-[width]"
          style={{ width: `${props.progressPercent}%` }}
        />
      </div>

      <div className="mt-4 text-sm text-zinc-400">画面タップでスタート / 一時停止</div>
    </button>
  );
}
