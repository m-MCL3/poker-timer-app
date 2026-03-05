import type { SnapshotKind } from "@/usecases/timer/timerSnapshot";

type Props = {
  blinds: SnapshotKind[];
};

export default function BlindsPanel({ blinds }: Props) {
  // 呼び出し側が壊れてても落ちない“最後の保険”
  const items = Array.isArray(blinds) ? blinds : [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="grid gap-3">
        {items.map((x) => (
          <div key={x.kind} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
            <div className="text-xs text-zinc-400">{x.kind.toUpperCase()}</div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-[10px] text-zinc-500">{x.labels.left}</div>
                <div className="font-semibold">{x.blinds.sb}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">{x.labels.mid}</div>
                <div className="font-semibold">{x.blinds.bb}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">{x.labels.right}</div>
                <div className="font-semibold">{x.blinds.ante}</div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-xs text-zinc-500">（ブラインド情報がありません）</div>
        )}
      </div>
    </div>
  );
}