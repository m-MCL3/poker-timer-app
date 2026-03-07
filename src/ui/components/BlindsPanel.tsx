import type { SnapshotBlindGroup } from "@/usecases/timer/timerSnapshot";

type Props = {
  blinds: SnapshotBlindGroup[];
};

export default function BlindsPanel(props: Props) {
  return (
    <section className="blinds-panel">
      {props.blinds.map((group) => (
        <div key={group.gameKind} className="blinds-panel__card">
          <div className="blinds-panel__title">{group.gameKind.toUpperCase()}</div>

          <div className="blinds-panel__row">
            <span>{group.labels.sb}</span>
            <span>{group.blinds.sb}</span>
          </div>

          <div className="blinds-panel__row">
            <span>{group.labels.bb}</span>
            <span>{group.blinds.bb}</span>
          </div>

          <div className="blinds-panel__row">
            <span>{group.labels.ante}</span>
            <span>{group.blinds.ante}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
