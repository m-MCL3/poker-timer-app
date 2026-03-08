type Props = {
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onOpenEditor: () => void;
  onOpenSettings: () => void;
};

export default function TimerActionPanel(props: Props) {
  return (
    <section className="surface card">
      <h2>Controls</h2>
      <div className="button-row">
        <button type="button" className="btn" onClick={props.onPrev}>
          Previous Level
        </button>
        <button type="button" className="btn" onClick={props.onNext}>
          Next Level
        </button>
        <button type="button" className="btn btn--danger" onClick={props.onReset}>
          Reset
        </button>
        <button type="button" className="btn btn--primary" onClick={props.onOpenEditor}>
          Edit Structure
        </button>
        <button type="button" className="btn btn--ghost" onClick={props.onOpenSettings}>
          Settings
        </button>
      </div>
    </section>
  );
}
