import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContainer } from "@/app/composition/containerContext";
import { useSubscription } from "@/presentation/hooks/useSubscription";
import { GAME_KIND_ORDER, blindSlotLabel, gameKindLabel, type BlindSlotId, type GameKindId } from "@/domain/blinds";
import type { EditorState } from "@/application/editor/EditorService";
import type { EditorOperation } from "@/domain/editorOperation";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string): number {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function EditorPage() {
  const { timerService, editorService, presetService } = useAppContainer();
  const version = useSubscription((listener) => timerService.subscribe(listener));
  const timerStatus = timerService.getStatus();

  const [editorState, setEditorState] = useState<EditorState>(() =>
    editorService.createState({
      structure: timerService.getStructure(),
      isEditable: timerService.isEditable(),
    }),
  );
  const [presets, setPresets] = useState<{ name: string; updatedAtEpochMs: number }[]>([]);

  useEffect(() => {
    setEditorState((current) =>
      editorService.setEditable({
        state: current,
        isEditable: timerService.isEditable(),
      }),
    );
  }, [editorService, timerService, timerStatus, version]);

  useEffect(() => {
    void presetService.listPresets().then(setPresets);
  }, [presetService]);

  const view = editorService.createView(editorState);

  function applyOperation(operation: EditorOperation) {
    setEditorState((current) => editorService.appendOperation({ state: current, operation }));
  }

  async function refreshPresets() {
    setPresets(await presetService.listPresets());
  }

  async function savePreset() {
    const name = window.prompt("プリセット名を入力してください", view.title);
    if (name === null) {
      return;
    }
    await presetService.savePreset(name, editorService.materializeStructure(editorState));
    await refreshPresets();
  }

  async function loadPreset(name: string) {
    const structure = await presetService.loadPreset(name);
    if (!structure) {
      window.alert("プリセットが見つかりません。");
      return;
    }

    timerService.loadStructureAsIdle(structure);
    setEditorState((current) => editorService.replaceBaseStructure({ state: current, structure }));
  }

  async function renamePreset(name: string) {
    const nextName = window.prompt("新しい名前を入力してください", name);
    if (nextName === null) {
      return;
    }
    await presetService.renamePreset(name, nextName);
    await refreshPresets();
  }

  async function deletePreset(name: string) {
    if (!window.confirm(`プリセット「${name}」を削除しますか？`)) {
      return;
    }
    await presetService.deletePreset(name);
    await refreshPresets();
  }

  function applyStructure() {
    try {
      timerService.replaceStructure(editorService.materializeStructure(editorState));
      setEditorState((current) =>
        editorService.replaceBaseStructure({
          state: current,
          structure: editorService.materializeStructure(current),
        }),
      );
      window.alert("タイマーへ反映しました。");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "反映に失敗しました。");
    }
  }

  const controlDisabled = !view.isEditable;

  return (
    <main className="page-shell editor-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Structure Editor</p>
          <h1>{view.title}</h1>
          <p className="text-muted">編集結果は operation stack として保持し、適用時だけタイマーへ反映します。</p>
        </div>
        <div className="button-row wrap-row">
          <Link className="ghost-button" to="/timer">
            Timerへ戻る
          </Link>
          <button className="ghost-button" disabled={!view.canUndo} onClick={() => setEditorState((current) => editorService.undo(current))}>
            Undo
          </button>
          <button className="ghost-button" disabled={!view.canRedo} onClick={() => setEditorState((current) => editorService.redo(current))}>
            Redo
          </button>
          <button className="primary-button" disabled={controlDisabled} onClick={applyStructure}>
            Apply to Timer
          </button>
        </div>
      </header>

      {!view.isEditable ? (
        <section className="surface card break-banner">
          <h2>編集ロック中</h2>
          <p className="text-muted">タイマー実行中は編集内容を反映できません。Pause か Reset で停止してから編集してください。</p>
        </section>
      ) : null}

      <section className="editor-top-grid">
        <section className="surface card">
          <h2>Structure</h2>
          <div className="form-grid">
            <label>
              <span>Name</span>
              <input
                value={view.title}
                disabled={controlDisabled}
                onChange={(event: any) => applyOperation({ type: "set-name", name: event.target.value })}
              />
            </label>
            <label>
              <span>Default Level Minutes</span>
              <input
                value={view.defaultLevelDurationMinutesText}
                disabled={controlDisabled}
                onChange={(event: any) =>
                  applyOperation({
                    type: "set-default-level-duration",
                    durationMinutes: parseRequiredNumber(event.target.value),
                  })
                }
              />
            </label>
            <label>
              <span>Default Break Minutes</span>
              <input
                value={view.defaultBreakDurationMinutesText}
                disabled={controlDisabled}
                onChange={(event: any) =>
                  applyOperation({
                    type: "set-default-break-duration",
                    durationMinutes: parseRequiredNumber(event.target.value),
                  })
                }
              />
            </label>
          </div>
          <div className="button-row wrap-row top-gap">
            <button className="ghost-button" disabled={controlDisabled} onClick={() => applyOperation({ type: "insert-level", index: view.rows.length, itemId: createId("level") })}>
              Add Level
            </button>
            <button className="ghost-button" disabled={controlDisabled} onClick={() => applyOperation({ type: "insert-break", index: view.rows.length, itemId: createId("break") })}>
              Add Break
            </button>
          </div>
        </section>

        <section className="surface card">
          <h2>Presets</h2>
          <div className="button-row wrap-row bottom-gap">
            <button className="ghost-button" disabled={controlDisabled} onClick={() => void savePreset()}>
              Save Preset
            </button>
            <button className="ghost-button" onClick={() => void refreshPresets()}>
              Reload List
            </button>
          </div>
          <div className="preset-list">
            {presets.map((preset) => (
              <div className="preset-row" key={preset.name}>
                <div>
                  <strong>{preset.name}</strong>
                  <p className="text-muted small-text">{new Date(preset.updatedAtEpochMs).toLocaleString("ja-JP")}</p>
                </div>
                <div className="button-row wrap-row">
                  <button className="ghost-button" onClick={() => void loadPreset(preset.name)}>
                    Load
                  </button>
                  <button className="ghost-button" onClick={() => void renamePreset(preset.name)}>
                    Rename
                  </button>
                  <button className="ghost-button danger-button" onClick={() => void deletePreset(preset.name)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {presets.length === 0 ? <p className="text-muted">まだプリセットはありません。</p> : null}
          </div>
        </section>
      </section>

      <section className="surface card">
        <h2>Items</h2>
        <div className="editor-table-wrapper">
          <table className="editor-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Label</th>
                <th>Minutes</th>
                {GAME_KIND_ORDER.map((gameKind) => (
                  <th key={gameKind}>{gameKindLabel(gameKind)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.itemId}>
                  <td>{row.itemNumber}</td>
                  <td>
                    <select
                      value={row.itemKind}
                      disabled={controlDisabled}
                      onChange={(event: any) =>
                        applyOperation({
                          type: "set-item-kind",
                          index: row.itemIndex,
                          kind: event.target.value as "level" | "break",
                          itemId: createId(event.target.value === "break" ? "break" : "level"),
                        })
                      }
                    >
                      <option value="level">Level</option>
                      <option value="break">Break</option>
                    </select>
                  </td>
                  <td>{row.itemLabel}</td>
                  <td>
                    <input
                      value={row.durationMinutesText}
                      disabled={controlDisabled}
                      onChange={(event: any) =>
                        applyOperation({
                          type: "set-duration",
                          index: row.itemIndex,
                          durationMinutes: parseRequiredNumber(event.target.value),
                        })
                      }
                    />
                  </td>
                  {row.blindCells.map((cell) => (
                    <td key={cell.gameKind}>
                      <div className="blind-cell-grid">
                        {(["sb", "bb", "ante"] as BlindSlotId[]).map((slot) => (
                          <label key={slot} className="mini-field">
                            <span>{blindSlotLabel(cell.gameKind, slot)}</span>
                            <input
                              value={cell[slot]}
                              disabled={controlDisabled || !row.canEditBlinds}
                              onChange={(event: any) =>
                                applyOperation({
                                  type: "set-blind",
                                  index: row.itemIndex,
                                  gameKind: cell.gameKind as GameKindId,
                                  slot,
                                  value: parseOptionalNumber(event.target.value),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  <td>
                    <div className="button-column">
                      <button className="ghost-button" disabled={controlDisabled} onClick={() => applyOperation({ type: "insert-level", index: row.itemIndex + 1, itemId: createId("level") })}>
                        +Level
                      </button>
                      <button className="ghost-button" disabled={controlDisabled} onClick={() => applyOperation({ type: "insert-break", index: row.itemIndex + 1, itemId: createId("break") })}>
                        +Break
                      </button>
                      <button className="ghost-button danger-button" disabled={controlDisabled || !row.canRemove} onClick={() => applyOperation({ type: "remove-item", index: row.itemIndex })}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
