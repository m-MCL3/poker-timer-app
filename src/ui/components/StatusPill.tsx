import type { TimerStatus } from "@/domain/entities/timerRuntime";

type Props = {
  status: TimerStatus;
};

function statusLabel(status: TimerStatus): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "finished":
      return "Finished";
  }
}

export default function StatusPill(props: Props) {
  return (
    <span className="status-pill" data-status={props.status}>
      {statusLabel(props.status)}
    </span>
  );
}
