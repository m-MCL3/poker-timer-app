import type { TimerScreenSnapshot } from "@/application/timer/timerSnapshot";
import StatusPill from "@/ui/components/StatusPill";

type Props = {
  snapshot: TimerScreenSnapshot;
  onToggle: () => void;
};

export default function TimerBoard(props: Props) {
  return (
    <section className="surface timer-board">
      <div className="timer-board__top">
        <StatusPill status={props.snapshot.status} />
        <div className="text-muted">Tap or click the timer to {props.snapshot.primaryActionLabel.toLowerCase()}</div>
      </div>

      <div className="timer-board__item">
        <div className="timer-board__label">Current Item</div>
        <div className="timer-board__value">{props.snapshot.currentItemLabel}</div>
      </div>

      <button
        type="button"
        className="timer-board__time"
        onClick={props.onToggle}
        title={props.snapshot.primaryActionLabel}
      >
        {props.snapshot.remainingText}
      </button>

      <div className="progress" aria-hidden="true">
        <div
          className="progress__bar"
          style={{ width: `${props.snapshot.progressPercent}%` }}
        />
      </div>

      <div className="cluster">
        <div className="stat">
          <span className="stat__label">Type</span>
          <span className="stat__value">{props.snapshot.currentItemKind === "break" ? "Break" : "Level"}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Duration</span>
          <span className="stat__value">{props.snapshot.currentItemDurationText}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Action</span>
          <span className="stat__value">{props.snapshot.primaryActionLabel}</span>
        </div>
      </div>
    </section>
  );
}
