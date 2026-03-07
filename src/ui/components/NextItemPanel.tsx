type Props = {
  text: string;
};

export default function NextItemPanel(props: Props) {
  return (
    <section className="next-level-panel">
      <div className="next-level-panel__title">NEXT ITEM</div>
      <div className="next-level-panel__body">{props.text}</div>
    </section>
  );
}
