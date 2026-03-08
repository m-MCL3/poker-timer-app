import {
  gameKindLabel,
  labelsForGameKind,
  type GameKindId,
} from "@/domain/models/blinds";
import type { SnapshotBlindGroup } from "@/usecases/timer/timerSnapshot";

type Props = {
  blindGroups: SnapshotBlindGroup[];
};

export default function BlindsPanel(props: Props) {
  const items = Array.isArray(props.blindGroups) ? props.blindGroups : [];

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((group) => {
        const labels = labelsForGameKind(group.gameKind as GameKindId);
        return (
          <div
            key={group.gameKind}
            className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl backdrop-blur"
          >
            <div className="text-xs tracking-[0.28em] text-zinc-500">
              {gameKindLabel(group.gameKind)}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-zinc-500">{labels.sb}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
                  {group.blinds.sb}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">{labels.bb}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
                  {group.blinds.bb}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">{labels.ante}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-100">
                  {group.blinds.ante}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 text-zinc-400">
          ブラインド情報がありません。
        </div>
      ) : null}
    </section>
  );
}
