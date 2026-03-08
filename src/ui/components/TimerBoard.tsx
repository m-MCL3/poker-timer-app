import type { TimerStatus } from "@/domain/models/timerRuntime";

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
      className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-[2rem] border border-zinc-800 bg-zinc-950/60 px-6 py-8 text-center"
      onClick={props.onToggleRequested}
    >
      <div className="text-xs font-semibold tracking-[0.3em] text-zinc-500">
        ITEM {props.currentItemNumber} / {props.totalItemCount}
      </div>

      <div className="mt-5 text-3xl font-semibold tracking-[0.18em] text-white">
        {props.currentItemLabel}
      </div>

      <div className="mt-4 text-xs font-semibold tracking-[0.35em] text-slate-400">
        {statusLabel(props.status)}
      </div>

      <div className="mt-6 font-mono text-7xl font-semibold tracking-[0.08em] text-white sm:text-8xl">
        {props.remainingText}
      </div>

      <div className="mt-6 text-xs tracking-[0.22em] text-zinc-500">
        画面タップでスタート / 一時停止
      </div>
    </button>
  );
}
