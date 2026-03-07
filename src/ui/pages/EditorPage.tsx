import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAME_KIND_ORDER, type BlindSlotId, type GameKindId } from "@/domain/entities/blinds";
import type { EditOperation } from "@/domain/entities/editOperation";
import {
  appendEditOperation,
  createEditorSnapshot,
  createEditorState,
  materializeEditorStructure,
  replaceEditorBaseStructure,
  resetEditorChanges,
  type EditorState,
} from "@/usecases/editor/editorUsecase";
import { replaceTournamentStructure } from "@/usecases/timer/timerUsecase";
import { useContainer } from "@/app/composition/containerContext";
import "./editor-table.css";

function parseBlindValue(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { timerStore, structureStorage } = useContainer();

  const [editorState, setEditorState] = useState<EditorState>(() =>
    createEditorState({
      structure: timerStore.getState().structure,
      isEditable: timerStore.getState().status !== "running",
    }),
  );
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [saveName, setSaveName] = useState("");
  const [loadName, setLoadName] = useState("");

  useEffect(() => {
    return timerStore.subscribe(() => {
      const timerState = timerStore.getState();
      setEditorState((prev) => ({
        ...prev,
        isEditable: timerState.status !== "running",
      }));
    });
  }, [timerStore]);

  const snapshot = useMemo(
    () => createEditorSnapshot(editorState),
    [editorState],
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!snapshot.isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [snapshot.isDirty]);

  async function refreshSavedNames(): Promise<void> {
    setSavedNames(await structureStorage.listNames());
  }

  useEffect(() => {
    void refreshSavedNames();
  }, [structureStorage]);

  function pushOperation(operation: EditOperation): void {
    setEditorState((prev) =>
      appendEditOperation({
        state: prev,
        operation,
      }),
    );
  }

  function backWithGuard(): void {
    if (!snapshot.isDirty) {
      navigate("/");
      return;
    }

    const isAccepted = confirm(
      "未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）",
    );
    if (!isAccepted) {
      return;
    }

    setEditorState((prev) => resetEditorChanges(prev));
    navigate("/");
  }

  function onApply(): void {
    if (!snapshot.isEditable) {
      return;
    }

    try {
      const nextTimerState = replaceTournamentStructure({
        state: timerStore.getState(),
        structure: materializeEditorStructure(editorState),
      });

      timerStore.setState(nextTimerState);

      setEditorState((prev) =>
        replaceEditorBaseStructure({
          state: prev,
          structure: nextTimerState.structure,
        }),
      );

      navigate("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Apply failed.");
    }
  }

  async function onSave(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const name = saveName.trim();
    if (!name) {
      alert("保存名を入力してください。");
      return;
    }

    await structureStorage.save(name, materializeEditorStructure(editorState));
    setSaveName("");
    setLoadName(name);
    await refreshSavedNames();
  }

  async function onLoad(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const name = loadName.trim();
    if (!name) {
      alert("読み込む名前を選択してください。");
      return;
    }

    const loaded = await structureStorage.load(name);
    if (!loaded) {
      alert("読み込みに失敗しました。");
      return;
    }

    setEditorState((prev) =>
      replaceEditorBaseStructure({
        state: prev,
        structure: loaded,
      }),
    );
  }

  async function onDeletePreset(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const name = loadName.trim();
    if (!name) {
      alert("削除するプリセットを選択してください。");
      return;
    }

    const isAccepted = confirm(`プリセット「${name}」を削除します。よろしいですか？`);
    if (!isAccepted) {
      return;
    }

    await structureStorage.remove(name);
    setLoadName("");
    await refreshSavedNames();
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <h1>Edit Structure</h1>
          <p>
            各行の「＋L」で下にLevel挿入、「＋B」で下にBreak挿入、
            「－」で行削除。TypeでLevel/Break切替。
          </p>
          {snapshot.isEditable ? null : (
            <p className="editor-readonly-message">
              running中は参照のみです。
            </p>
          )}
        </div>

        <button type="button" onClick={backWithGuard}>
          ← Back
        </button>
      </div>

      <section className="editor-save-load">
        <h2>Save / Load</h2>

        <div className="editor-save-load-row">
          <input
            value={saveName}
            onChange={(event) => setSaveName(event.target.value)}
            disabled={!snapshot.isEditable}
            placeholder="保存名"
          />
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={!snapshot.isEditable}
          >
            Save
          </button>

          <select
            value={loadName}
            onChange={(event) => setLoadName(event.target.value)}
            disabled={!snapshot.isEditable}
          >
            <option value="">（保存済みを選択）</option>
            {savedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void onLoad()}
            disabled={!snapshot.isEditable}
          >
            Load
          </button>

          <button
            type="button"
            onClick={() => void onDeletePreset()}
            disabled={!snapshot.isEditable}
          >
            Delete
          </button>
        </div>
      </section>

      <section className="editor-table-section">
        <table className="editor-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Item</th>
              <th>Type</th>
              <th>Min</th>
              {GAME_KIND_ORDER.map((gameKind) => (
                <th key={gameKind}>{gameKind.toUpperCase()} (SB / BB / Ante)</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {snapshot.rows.map((row) => (
              <tr key={row.itemId}>
                <td className="editor-actions-cell">
                  <button
                    type="button"
                    onClick={() =>
                      pushOperation({
                        type: "insert-level-after",
                        itemIndex: row.itemIndex,
                      })
                    }
                    disabled={!snapshot.isEditable}
                    title="下にLevel挿入"
                  >
                    ＋L
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      pushOperation({
                        type: "insert-break-after",
                        itemIndex: row.itemIndex,
                      })
                    }
                    disabled={!snapshot.isEditable}
                    title="下にBreak挿入"
                  >
                    ＋B
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      pushOperation({
                        type: "remove-item",
                        itemIndex: row.itemIndex,
                      })
                    }
                    disabled={!snapshot.isEditable || !row.canRemove}
                    title="この行を削除"
                  >
                    －
                  </button>
                </td>

                <td>
                  ITEM {row.itemNumber}
                  <div>{row.itemLabel}</div>
                </td>

                <td>
                  <select
                    value={row.itemKind}
                    onChange={(event) =>
                      pushOperation({
                        type: "change-item-kind",
                        itemIndex: row.itemIndex,
                        kind: event.target.value as "level" | "break",
                      })
                    }
                    disabled={!snapshot.isEditable}
                  >
                    <option value="level">Level</option>
                    <option value="break">Break</option>
                  </select>
                </td>

                <td>
                  <input
                    value={row.durationMinutesText}
                    onChange={(event) =>
                      pushOperation({
                        type: "set-duration-minutes",
                        itemIndex: row.itemIndex,
                        minutes: Number(event.target.value),
                      })
                    }
                    disabled={!snapshot.isEditable}
                    inputMode="numeric"
                  />
                </td>

                {row.blindCells.map((cell) => (
                  <td key={cell.gameKind}>
                    {row.canEditBlinds ? (
                      <div className="editor-blind-inputs">
                        <input
                          value={cell.sb}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex: row.itemIndex,
                              gameKind: cell.gameKind as GameKindId,
                              slot: "sb" as BlindSlotId,
                              value: parseBlindValue(event.target.value),
                            })
                          }
                          disabled={!snapshot.isEditable}
                          inputMode="numeric"
                          placeholder="SB"
                        />
                        <input
                          value={cell.bb}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex: row.itemIndex,
                              gameKind: cell.gameKind as GameKindId,
                              slot: "bb" as BlindSlotId,
                              value: parseBlindValue(event.target.value),
                            })
                          }
                          disabled={!snapshot.isEditable}
                          inputMode="numeric"
                          placeholder="BB"
                        />
                        <input
                          value={cell.ante}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex: row.itemIndex,
                              gameKind: cell.gameKind as GameKindId,
                              slot: "ante" as BlindSlotId,
                              value: parseBlindValue(event.target.value),
                            })
                          }
                          disabled={!snapshot.isEditable}
                          inputMode="numeric"
                          placeholder="Ante"
                        />
                      </div>
                    ) : (
                      <span className="editor-break-cell">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="editor-footer">
        <button
          type="button"
          onClick={() => setEditorState((prev) => resetEditorChanges(prev))}
          disabled={!snapshot.isDirty}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onApply}
          disabled={!snapshot.isEditable || !snapshot.isDirty}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
