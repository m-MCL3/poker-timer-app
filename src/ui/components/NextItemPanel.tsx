type Props = {
  nextItemText: string;
  nextBreakText: string;
};

export default function NextItemPanel(props: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold tracking-[0.3em] text-slate-400">
            NEXT ITEM
          </div>
          <div className="mt-2 text-base font-medium text-white">
            {props.nextItemText}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-[0.3em] text-slate-400">
            NEXT BREAK IN
          </div>
          <div className="mt-2 text-base font-medium text-white">
            {props.nextBreakText}
          </div>
        </div>
      </div>
    </section>
  );
}
