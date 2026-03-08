import { blindSlotLabels, gameKindLabel, type BlindSlot, type GameKind } from "@/domain/entities/blinds";
import { GAME_KIND_ORDER } from "@/domain/entities/blinds";
import type { EditorSnapshot } from "@/application/editor/editorModels";

type Props = {
  snapshot: EditorSnapshot;
  onInsertLevelAfter: (itemIndex: number) => void;
  onInsertBreakAfter: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSetItemKind: (itemIndex: number, nextKind: "level" | "break") => void;
  onSetItemDuration: (itemIndex: number, text: string) => void;
  onSetBlind: (
    itemIndex: number,
    gameKind: GameKind,
    slot: BlindSlot,
    text: string,
  ) => void;
};

export default function EditorTable(props: Props) {
  return (
    <div className="editor-table-wrap">
      <table className="editor-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Label</th>
            <th>Type</th>
            <th>Minutes</th>
            {GAME_KIND_ORDER.flatMap((gameKind) => {
              const labels = blindSlotLabels(gameKind);
              return [
                <th key={`${gameKind}-sb`}>{gameKindLabel(gameKind)} {labels.sb}</th>,
                <th key={`${gameKind}-bb`}>{gameKindLabel(gameKind)} {labels.bb}</th>,
                <th key={`${gameKind}-ante`}>{gameKindLabel(gameKind)} {labels.ante}</th>,
              ];
            })}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.snapshot.rows.map((row) => (
            <tr key={row.itemId}>
              <td>{row.itemNumber}</td>
              <td>{row.itemLabel}</td>
              <td>
                <select
                  value={row.itemKind}
                  disabled={!props.snapshot.isEditable}
                  onChange={(event) =>
                    props.onSetItemKind(
                      row.itemIndex,
                      event.target.value as "level" | "break",
                    )
                  }
                >
                  <option value="level">Level</option>
                  <option value="break">Break</option>
                </select>
              </td>
              <td>
                <input
                  value={row.durationMinutesText}
                  disabled={!props.snapshot.isEditable}
                  onChange={(event) =>
                    props.onSetItemDuration(row.itemIndex, event.target.value)
                  }
                />
              </td>
              {GAME_KIND_ORDER.flatMap((gameKind) =>
                (["sb", "bb", "ante"] as BlindSlot[]).map((slot) => (
                  <td key={`${row.itemId}-${gameKind}-${slot}`}>
                    <input
                      value={row.blindValues[gameKind][slot]}
                      disabled={!props.snapshot.isEditable || !row.canEditBlinds}
                      onChange={(event) =>
                        props.onSetBlind(
                          row.itemIndex,
                          gameKind,
                          slot,
                          event.target.value,
                        )
                      }
                    />
                  </td>
                )),
              )}
              <td>
                <div className="editor-table__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={!props.snapshot.isEditable}
                    onClick={() => props.onInsertLevelAfter(row.itemIndex)}
                  >
                    ＋L
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={!props.snapshot.isEditable}
                    onClick={() => props.onInsertBreakAfter(row.itemIndex)}
                  >
                    ＋B
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={!props.snapshot.isEditable || !row.canRemove}
                    onClick={() => props.onRemoveItem(row.itemIndex)}
                  >
                    －
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
