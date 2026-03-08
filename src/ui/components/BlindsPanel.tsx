import {
  blindSlotLabels,
  gameKindLabel,
} from "@/domain/entities/blinds";
import type { SnapshotBlindGroup } from "@/usecases/timer/timerSnapshot";

type Props = {
  blindGroups: SnapshotBlindGroup[];
};

export default function BlindsPanel(props: Props) {
  const groups = Array.isArray(props.blindGroups) ? props.blindGroups : [];

  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="text-xs tracking-[0.3em] text-zinc-500">BLINDS</div>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
          ブラインド情報がありません。
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {groups.map((group) => {
            const labels = blindSlotLabels(group.gameKind);
            return (
              <div
                key={group.gameKind}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="text-sm font-semibold text-white">
                  {gameKindLabel(group.gameKind)}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">{labels.sb}</dt>
                    <dd className="mt-1 text-lg font-semibold text-cyan-100">{group.blinds.sb}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">{labels.bb}</dt>
                    <dd className="mt-1 text-lg font-semibold text-cyan-100">{group.blinds.bb}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">{labels.ante}</dt>
                    <dd className="mt-1 text-lg font-semibold text-cyan-100">{group.blinds.ante}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
