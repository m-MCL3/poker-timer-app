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
      onClick={props.onToggleRequested}
      className="w-full rounded-[2rem] border border-zinc-800 bg-zinc-950/70 px-6 py-8 text-left shadow-2xl backdrop-blur"
    >
      <div className="text-sm tracking-[0.25em] text-zinc-400">
        ITEM {props.currentItemNumber} / {props.totalItemCount}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-wide text-zinc-100">
        {props.currentItemLabel}
      </div>
      <div className="mt-4 text-sm tracking-[0.3em] text-cyan-300">
        {statusLabel(props.status)}
      </div>
      <div className="mt-2 text-7xl font-black tabular-nums tracking-tight text-white sm:text-8xl">
        {props.remainingText}
      </div>
      <div className="mt-4 text-sm text-zinc-400">画面タップでスタート / 一時停止</div>
    </button>
  );
}
