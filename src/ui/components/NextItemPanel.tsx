type Props = {
  nextItemText: string;
  nextBreakText: string;
};

export default function NextItemPanel(props: Props) {
  return (
    <section className="grid gap-4 rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl backdrop-blur sm:grid-cols-2">
      <div>
        <div className="text-xs tracking-[0.28em] text-zinc-500">NEXT ITEM</div>
        <div className="mt-2 text-lg text-zinc-100">{props.nextItemText}</div>
      </div>
      <div>
        <div className="text-xs tracking-[0.28em] text-zinc-500">NEXT BREAK IN</div>
        <div className="mt-2 text-lg font-semibold tabular-nums text-zinc-100">
          {props.nextBreakText}
        </div>
      </div>
    </section>
  );
}
