type Props = {
  nextItemText: string;
  nextBreakText: string;
};

export default function NextQueueCard(props: Props) {
  return (
    <section className="surface card next-card">
      <h2>Queue</h2>
      <div className="next-card__line">
        <span className="next-card__label">Next Item</span>
        <strong>{props.nextItemText}</strong>
      </div>
      <div className="next-card__line">
        <span className="next-card__label">Next Break</span>
        <strong>{props.nextBreakText}</strong>
      </div>
    </section>
  );
}
