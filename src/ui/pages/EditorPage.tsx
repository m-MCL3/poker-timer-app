import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GAME_KIND_ORDER,
  type BlindSlotId,
  type GameKindId,
} from "@/domain/models/blinds";
import type { EditorState, EditOperation } from "@/domain/models/editor";
import type { PresetSummary } from "@/domain/models/preset";
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

function formatPresetLabel(preset: PresetSummary): string {
  if (preset.updatedAtEpochMs <= 0) {
    return preset.name;
  }

  const date = new Date(preset.updatedAtEpochMs);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${preset.name} (${yyyy}-${mm}-${dd} ${hh}:${mi})`;
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { editorUsecase, presetUsecase, timerUsecase } = useContainer();

  const [editorState, setEditorState] = useState<EditorState>(() =>
    editorUsecase.createState({
      structure: timerUsecase.getStructure(),
      isEditable: timerUsecase.isEditable(),
    }),
  );
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [saveName, setSaveName] = useState("");
  const [loadName, setLoadName] = useState("");

  useEffect(() => {
    return timerUsecase.subscribe(() => {
      setEditorState((prev) =>
        editorUsecase.setEditable({
          state: prev,
          isEditable: timerUsecase.isEditable(),
        }),
      );
    });
  }, [editorUsecase, timerUsecase]);

  const snapshot = useMemo(
    () => editorUsecase.createSnapshot(editorState),
    [editorState, editorUsecase],
  );

  async function refreshPresets(): Promise<void> {
    setPresets(await presetUsecase.listPresets());
  }

  useEffect(() => {
    void refreshPresets();
  }, []);

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

  function pushOperation(operation: EditOperation): void {
    setEditorState((prev) =>
      editorUsecase.appendOperation({
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

    setEditorState((prev) => editorUsecase.resetChanges(prev));
    navigate("/");
  }

  function onApply(): void {
    if (!snapshot.isEditable) {
      return;
    }

    try {
      const structure = editorUsecase.materializeStructure(editorState);
      timerUsecase.applyEditedStructure(structure);
      setEditorState((prev) =>
        editorUsecase.replaceBaseStructure({
          state: prev,
          structure,
        }),
      );
      navigate("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Apply failed.");
    }
  }

  async function onSavePreset(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const normalizedName = presetUsecase.normalizeName(saveName);
    const validationError = presetUsecase.validateName(normalizedName);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (presetUsecase.hasPreset(presets, normalizedName)) {
      const isAccepted = confirm(
        `プリセット「${normalizedName}」は既に存在します。上書きしますか？`,
      );
      if (!isAccepted) {
        return;
      }
    }

    await presetUsecase.savePreset(
      normalizedName,
      editorUsecase.materializeStructure(editorState),
    );
    setSaveName("");
    setLoadName(normalizedName);
    await refreshPresets();
  }

  async function onLoadPreset(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const normalizedName = presetUsecase.normalizeName(loadName);
    if (!normalizedName) {
      alert("読み込むプリセットを選択してください。");
      return;
    }

    if (snapshot.isDirty) {
      const isAccepted = confirm(
        "未適用の変更があります。破棄してプリセットを読み込みますか？",
      );
      if (!isAccepted) {
        return;
      }
    }

    const loaded = await presetUsecase.loadPreset(normalizedName);
    if (!loaded) {
      alert("プリセットの読み込みに失敗しました。");
      return;
    }

    try {
      timerUsecase.loadPresetStructure(loaded);
      setEditorState((prev) =>
        editorUsecase.replaceBaseStructure({
          state: prev,
          structure: loaded,
        }),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "プリセットの適用に失敗しました。");
    }
  }

  async function onRenamePreset(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const currentName = presetUsecase.normalizeName(loadName);
    if (!currentName) {
      alert("リネームするプリセットを選択してください。");
      return;
    }

    const inputName = window.prompt(
      `プリセット「${currentName}」の新しい名前を入力してください。`,
      currentName,
    );
    if (inputName === null) {
      return;
    }

    const nextName = presetUsecase.normalizeName(inputName);
    const validationError = presetUsecase.validateName(nextName);
    if (validationError) {
      alert(validationError);
      return;
    }
    if (nextName === currentName) {
      return;
    }
    if (presetUsecase.hasPreset(presets, nextName)) {
      alert(`プリセット「${nextName}」は既に存在します。`);
      return;
    }

    await presetUsecase.renamePreset(currentName, nextName);
    setLoadName(nextName);
    await refreshPresets();
  }

  async function onDeletePreset(): Promise<void> {
    if (!snapshot.isEditable) {
      return;
    }

    const normalizedName = presetUsecase.normalizeName(loadName);
    if (!normalizedName) {
      alert("削除するプリセットを選択してください。");
      return;
    }

    const isAccepted = confirm(
      `プリセット「${normalizedName}」を削除します。よろしいですか？`,
    );
    if (!isAccepted) {
      return;
    }

    await presetUsecase.deletePreset(normalizedName);
    setLoadName("");
    await refreshPresets();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#09090b_55%,#000000_100%)] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Edit Structure</h1>
          <p className="mt-3 text-sm text-zinc-400">
            各行の「＋L」で下にLevel挿入、「＋B」で下にBreak挿入、
            「－」で行削除。TypeでLevel/Break切替。
          </p>
          {!snapshot.isEditable ? (
            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              running中は参照のみです。
            </p>
          ) : null}
        </header>

        <button
          type="button"
          className="mb-6 rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900/60"
          onClick={backWithGuard}
        >
          ← Back
        </button>

        <section className="mb-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl">
          <h2 className="text-xl font-semibold">Presets</h2>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
                disabled={!snapshot.isEditable}
                placeholder="プリセット名"
                className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => void onSavePreset()}
                disabled={!snapshot.isEditable}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              <select
                value={loadName}
                onChange={(event) => setLoadName(event.target.value)}
                disabled={!snapshot.isEditable}
                className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="">（プリセットを選択）</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {formatPresetLabel(preset)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void onLoadPreset()}
                disabled={!snapshot.isEditable}
                className="rounded-xl border border-zinc-700 px-4 py-3 text-sm hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Load Preset
              </button>
              <button
                type="button"
                onClick={() => void onRenamePreset()}
                disabled={!snapshot.isEditable}
                className="rounded-xl border border-zinc-700 px-4 py-3 text-sm hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rename Preset
              </button>
              <button
                type="button"
                onClick={() => void onDeletePreset()}
                disabled={!snapshot.isEditable}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Preset
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="editor-table w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-zinc-900/70 text-left text-xs tracking-[0.24em] text-zinc-400">
                  <th className="px-4 py-4">Actions</th>
                  <th className="px-4 py-4">Item</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Min</th>
                  {GAME_KIND_ORDER.map((gameKind) => (
                    <th key={gameKind} className="px-4 py-4">
                      {gameKind.toUpperCase()} (SB / BB / Ante)
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {snapshot.rows.map((row) => (
                  <tr key={row.itemId} className="border-t border-zinc-800/80 align-top">
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          －
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-xs tracking-[0.28em] text-zinc-500">
                        ITEM {row.itemNumber}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-zinc-100">
                        {row.itemLabel}
                      </div>
                    </td>

                    <td className="px-4 py-4">
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
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm"
                      >
                        <option value="level">Level</option>
                        <option value="break">Break</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
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
                        className="w-24 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm"
                      />
                    </td>

                    {row.blindCells.map((cell) => (
                      <td key={`${row.itemId}-${cell.gameKind}`} className="px-4 py-4">
                        {row.canEditBlinds ? (
                          <div className="grid grid-cols-3 gap-2">
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
                              className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm"
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
                              className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm"
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
                              className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm"
                            />
                          </div>
                        ) : (
                          <div className="text-zinc-500">-</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-5 py-4">
            <button
              type="button"
              onClick={() => setEditorState((prev) => editorUsecase.resetChanges(prev))}
              disabled={!snapshot.isDirty}
              className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2 font-medium text-cyan-100 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
