import { blindSlotLabel, gameKindLabel } from "@/domain/blinds";
import type { TimerBlindGroupView } from "@/application/timer/timerView";

export default function BlindsPanel({ groups }: { groups: TimerBlindGroupView[] }) {
  return (
    <section className="surface card">
      <h2>Current Blinds</h2>
      <div className="blind-grid">
        {groups.map((group) => (
          <article key={group.gameKind} className="blind-card">
            <h3>{gameKindLabel(group.gameKind)}</h3>
            <dl>
              <div>
                <dt>{blindSlotLabel(group.gameKind, "sb")}</dt>
                <dd>{group.blinds.sb}</dd>
              </div>
              <div>
                <dt>{blindSlotLabel(group.gameKind, "bb")}</dt>
                <dd>{group.blinds.bb}</dd>
              </div>
              <div>
                <dt>{blindSlotLabel(group.gameKind, "ante")}</dt>
                <dd>{group.blinds.ante}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
