import type { GameKindId } from "@/domain/models/blinds";
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

function slotLabels(gameKind: GameKindId): { sb: string; bb: string; ante: string } {
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
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((group) => {
        const labels = slotLabels(group.gameKind);
        return (
          <section
            key={group.gameKind}
            className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 px-5 py-4"
          >
            <div className="text-xs font-semibold tracking-[0.3em] text-zinc-500">
              {gameKindLabel(group.gameKind)}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  {labels.sb}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {group.blinds.sb}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  {labels.bb}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {group.blinds.bb}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  {labels.ante}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {group.blinds.ante}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 px-5 py-4 text-sm text-zinc-400 md:col-span-3">
          ブラインド情報がありません。
        </div>
      )}
    </div>
  );
}
