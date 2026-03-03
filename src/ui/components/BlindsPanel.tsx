import type { SnapshotKind } from "@/usecases/timer/timerSnapshot";

function KindTitle(kind: string) {
  if (kind === "fl") return "FL";
  if (kind === "stud") return "STUD";
  return "NL/PL";
}

export default function BlindsPanel(props: { kinds: SnapshotKind[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {props.kinds.map((k) => (
        <div key={k.kind} className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3">
          <div className="mb-2 text-xs text-zinc-400">{KindTitle(k.kind)}</div>

          {/* 上段ラベル3項目 */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
            <div className="truncate">{k.labels.left}</div>
            <div className="truncate text-center">{k.labels.mid}</div>
            <div className="truncate text-right">{k.labels.right}</div>
          </div>

          {/* 下段 値3項目：文字列結合禁止（独立描画） */}
          <div className="mt-1 grid grid-cols-3 gap-2 font-mono text-xl sm:text-2xl">
            <div className="truncate">{k.blinds.sb}</div>
            <div className="truncate text-center">{k.blinds.bb}</div>
            <div className="truncate text-right">{k.blinds.ante}</div>
          </div>

          {/* 表示形式 A / B ( C ) は「レイアウト」で表現（結合はしない） */}
          <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-zinc-500">
            <div>A</div>
            <div className="text-center">/ B</div>
            <div className="text-right">( C )</div>
          </div>
        </div>
      ))}
    </div>
  );
}