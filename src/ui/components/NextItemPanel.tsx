type Props = {
  nextItemText: string;
  nextBreakText: string;
};

export default function NextItemPanel(props: Props) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs tracking-[0.3em] text-zinc-500">NEXT ITEM</div>
          <div className="mt-3 text-2xl font-semibold text-white">{props.nextItemText}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs tracking-[0.3em] text-zinc-500">NEXT BREAK IN</div>
          <div className="mt-3 text-2xl font-semibold text-white">{props.nextBreakText}</div>
        </div>
      </div>
    </section>
  );
}
