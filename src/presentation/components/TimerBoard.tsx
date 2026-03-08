import type { TimerView } from "@/application/timer/timerView";

function actionLabel(status: TimerView["status"]): string {
  switch (status) {
    case "idle":
      return "START";
    case "running":
      return "PAUSE";
    case "paused":
      return "RESUME";
    case "finished":
      return "RESET";
  }
}

export default function TimerBoard({ snapshot, onToggle }: { snapshot: TimerView; onToggle: () => void }) {
  return (
    <button className="timer-board" onClick={onToggle}>
      <div className="timer-board-status">{snapshot.status.toUpperCase()}</div>
      <div className="timer-board-time">{snapshot.remainingText}</div>
      <div className="timer-board-title">{snapshot.currentItemLabel}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${snapshot.progressPercent}%` }} />
      </div>
      <div className="timer-board-meta">
        <span>
          {snapshot.currentItemNumber} / {snapshot.totalItemCount}
        </span>
        <span>{actionLabel(snapshot.status)}</span>
      </div>
    </button>
  );
}
