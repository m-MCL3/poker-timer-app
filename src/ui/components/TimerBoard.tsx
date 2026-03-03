import type { TimerStatus } from "@/domain/entities/timer";

export default function TimerBoard(props: {
  timeText: string;
  status: TimerStatus;
  levelText: string;
}) {
  const statusText =
    props.status === "idle" ? "IDLE" :
    props.status === "running" ? "RUNNING" :
    props.status === "paused" ? "PAUSED" :
    "FINISHED";

  return (
    <div className="rounded-2xl bg-zinc-950/40 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">{props.levelText}</div>
        <div className="text-xs text-zinc-400">{statusText}</div>
      </div>
      <div className="mt-2 font-mono text-5xl sm:text-6xl tracking-wider">
        {props.timeText}
      </div>
    </div>
  );
}