export default function NextItemPanel({
  nextItemText,
  nextBreakText,
}: {
  nextItemText: string;
  nextBreakText: string;
}) {
  return (
    <section className="surface card next-panel">
      <div>
        <p className="eyebrow">Next Item</p>
        <strong>{nextItemText}</strong>
      </div>
      <div>
        <p className="eyebrow">Next Break</p>
        <strong>{nextBreakText}</strong>
      </div>
    </section>
  );
}
