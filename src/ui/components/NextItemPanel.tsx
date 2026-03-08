type Props = {
  nextItemText: string;
  nextBreakText: string;
};

export default function NextItemPanel(props: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 px-5 py-4">
        <div className="text-xs font-semibold tracking-[0.3em] text-zinc-500">
          NEXT ITEM
        </div>
        <div className="mt-3 text-sm leading-relaxed text-zinc-100">
          {props.nextItemText}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 px-5 py-4">
        <div className="text-xs font-semibold tracking-[0.3em] text-zinc-500">
          NEXT BREAK IN
        </div>
        <div className="mt-3 font-mono text-2xl font-semibold tracking-[0.14em] text-zinc-100">
          {props.nextBreakText}
        </div>
      </section>
    </div>
  );
}
