import type { TimerStatus } from "@/domain/entities/timerState";

type Props = {
  status: TimerStatus;
  currentItemNumber: number;
  totalItemCount: number;
  currentItemLabel: string;
  remainingText: string;
  onTap: () => void;
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
    <button type="button" className="timer-board" onClick={props.onTap}>
      <div className="timer-board__item-count">
        ITEM {props.currentItemNumber} / {props.totalItemCount}
      </div>
      <div className="timer-board__item-label">{props.currentItemLabel}</div>
      <div className="timer-board__status">{statusLabel(props.status)}</div>
      <div className="timer-board__time">{props.remainingText}</div>
      <div className="timer-board__hint">Tap to Start/Stop</div>
    </button>
  );
}
