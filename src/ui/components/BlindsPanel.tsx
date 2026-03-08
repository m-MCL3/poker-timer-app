import type { GameKindId } from "@/domain/entities/blinds";
import type { SnapshotBlindGroup } from "@/usecases/timer/timerSnapshot";

type Props = {
  blindGroups: SnapshotBlindGroup[];
};

function gameKindLabel(gameKind: GameKindId): string {
  if (gameKind === "fl") {
    return "FL";
  }

  if (gameKind === "stud") {
    return "STUD";
  }

  return "NL / PL";
}

function slotLabels(gameKind: GameKindId): {
  sb: string;
  bb: string;
  ante: string;
} {
  if (gameKind === "stud") {
    return {
      sb: "Bring-in",
      bb: "Complete",
      ante: "Ante",
    };
  }

  return {
    sb: "SB",
    bb: "BB",
    ante: "Ante",
  };
}

export default function BlindsPanel(props: Props) {
  const items = Array.isArray(props.blindGroups) ? props.blindGroups : [];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
      <div className="space-y-4">
        {items.map((group) => {
          const labels = slotLabels(group.gameKind);

          return (
            <div
              key={group.gameKind}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
            >
              <div className="text-xs font-semibold tracking-[0.3em] text-slate-400">
                {gameKindLabel(group.gameKind)}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-400">{labels.sb}</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {group.blinds.sb}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">{labels.bb}</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {group.blinds.bb}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">{labels.ante}</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {group.blinds.ante}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            ブラインド情報がありません。
          </div>
        )}
      </div>
    </section>
  );
}
