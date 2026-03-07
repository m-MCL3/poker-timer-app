import type { SnapshotBlindGroup } from "@/usecases/timer/timerSnapshot";

type Props = {
  blinds: SnapshotBlindGroup[];
};

export default function BlindsPanel(props: Props) {
  const items = Array.isArray(props.blinds) ? props.blinds : [];

  return (
    <section className="blinds-panel">
      {items.map((group) => (
        <div key={group.gameKind} className="blinds-panel__card">
          <div className="blinds-panel__title">
            {group.gameKind.toUpperCase()}
          </div>

          <div className="blinds-panel__row">
            <span>{group.labels.left}</span>
            <span>{group.blinds.sb}</span>
          </div>

          <div className="blinds-panel__row">
            <span>{group.labels.mid}</span>
            <span>{group.blinds.bb}</span>
          </div>

          <div className="blinds-panel__row">
            <span>{group.labels.right}</span>
            <span>{group.blinds.ante}</span>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="blinds-panel__empty">（ブラインド情報がありません）</div>
      )}
    </section>
  );
}
