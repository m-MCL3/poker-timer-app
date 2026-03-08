import type { BlindGroupSnapshot } from "@/application/timer/timerSnapshot";

type Props = {
  groups: BlindGroupSnapshot[];
};

export default function BlindMatrix(props: Props) {
  return (
    <section className="surface card">
      <h2>Current Blinds</h2>
      <div className="matrix">
        {props.groups.map((group) => (
          <div key={group.gameKind} className="matrix__group">
            <div className="matrix__title">{group.gameKind}</div>
            <div className="matrix__row">
              {group.slots.map((slot) => (
                <div key={slot.label} className="stat">
                  <span className="stat__label">{slot.label}</span>
                  <span className="stat__value">{slot.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
