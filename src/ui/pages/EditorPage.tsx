import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GAME_KIND_ORDER,
  gameKindLabel,
  type BlindSlotId,
  type GameKindId,
} from "@/domain/entities/blinds";
import type { EditOperation } from "@/domain/entities/editOperation";
import type { StructurePresetSummary } from "@/domain/entities/structurePreset";
import { useContainer } from "@/app/composition/containerContext";
import "@/ui/pages/editor-table.css";

function parseBlindValue(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPresetLabel(preset: StructurePresetSummary): string {
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

function isUndoShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";
}

function isRedoShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  return (
    ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "z") ||
    ((event.ctrlKey || event.metaKey) && key === "y")
  );
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { editorUsecase, presetUsecase, timerUsecase } = useContainer();
  const [editorState, setEditorState] = useState(() =>
    editorUsecase.createState({
      structure: timerUsecase.getStructure(),
      isEditable: timerUsecase.isEditable(),
    }),
  );
  const [presets, setPresets] = useState<StructurePresetSummary[]>([]);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (!snapshot.isEditable || isTyping) {
        return;
      }

      if (isUndoShortcut(event)) {
        event.preventDefault();
        setEditorState((prev) => editorUsecase.undo(prev));
        return;
      }

      if (isRedoShortcut(event)) {
        event.preventDefault();
        setEditorState((prev) => editorUsecase.redo(prev));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorUsecase, snapshot.isEditable]);

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

    const accepted = confirm("未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）");
    if (!accepted) {
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
      const accepted = confirm(`プリセット「${normalizedName}」は既に存在します。上書きしますか？`);
      if (!accepted) {
        return;
      }
    }

    await presetUsecase.savePreset(normalizedName, editorUsecase.materializeStructure(editorState));
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
      const accepted = confirm("未適用の変更があります。破棄してプリセットを読み込みますか？");
      if (!accepted) {
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

    const inputName = window.prompt(`プリセット「${currentName}」の新しい名前を入力してください。`, currentName);
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

    const accepted = confirm(`プリセット「${normalizedName}」を削除します。よろしいですか？`);
    if (!accepted) {
      return;
    }

    await presetUsecase.deletePreset(normalizedName);
    setLoadName("");
    await refreshPresets();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs tracking-[0.35em] text-cyan-200/70">EDIT STRUCTURE</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">{snapshot.title}</h1>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                各行の「＋L」で下にLevel挿入、「＋B」で下にBreak挿入、「－」で行削除。TypeでLevel/Break切替。
                Undo: Ctrl/Cmd + Z, Redo: Ctrl/Cmd + Shift + Z または Ctrl/Cmd + Y
              </p>
            </div>
            <button
              type="button"
              onClick={backWithGuard}
              className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
            >
              ← Back
            </button>
          </div>

          {!snapshot.isEditable ? (
            <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              running中は参照のみです。
            </div>
          ) : null}
        </header>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <h2 className="text-lg font-semibold text-white">Presets</h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_auto_auto]">
            <input
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              disabled={!snapshot.isEditable}
              placeholder="プリセット名"
              className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void onSavePreset()}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Preset
            </button>
            <select
              value={loadName}
              onChange={(event) => setLoadName(event.target.value)}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Load Preset
            </button>
            <button
              type="button"
              onClick={() => void onRenamePreset()}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rename Preset
            </button>
            <button
              type="button"
              onClick={() => void onDeletePreset()}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Preset
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Structure Items</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditorState((prev) => editorUsecase.undo(prev))}
                disabled={!snapshot.canUndo}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => setEditorState((prev) => editorUsecase.redo(prev))}
                disabled={!snapshot.canRedo}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Redo
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[1320px] w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-zinc-800 text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-left text-zinc-300">
                  <th className="px-3 py-3 font-medium">Actions</th>
                  <th className="px-3 py-3 font-medium">Item</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Min</th>
                  {GAME_KIND_ORDER.map((gameKind) => (
                    <th key={gameKind} className="px-3 py-3 font-medium">
                      {gameKindLabel(gameKind)} (SB / BB / Ante)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshot.rows.map((row, rowIndex) => (
                  <tr key={row.itemId} className={rowIndex % 2 === 0 ? "bg-zinc-950/80" : "bg-zinc-900/45"}>
                    <td className="border-t border-zinc-800 px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          －
                        </button>
                      </div>
                    </td>
                    <td className="border-t border-zinc-800 px-3 py-3 align-top">
                      <div className="font-medium text-white">ITEM {row.itemNumber}</div>
                      <div className="mt-1 text-zinc-400">{row.itemLabel}</div>
                    </td>
                    <td className="border-t border-zinc-800 px-3 py-3 align-top">
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
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white"
                      >
                        <option value="level">Level</option>
                        <option value="break">Break</option>
                      </select>
                    </td>
                    <td className="border-t border-zinc-800 px-3 py-3 align-top">
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
                        className="w-24 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white"
                      />
                    </td>
                    {row.blindCells.map((cell) => (
                      <td key={`${row.itemId}-${cell.gameKind}`} className="border-t border-zinc-800 px-3 py-3 align-top">
                        {row.canEditBlinds ? (
                          <div className="grid grid-cols-3 gap-2">
                            {(["sb", "bb", "ante"] as BlindSlotId[]).map((slot) => (
                              <input
                                key={`${row.itemId}-${cell.gameKind}-${slot}`}
                                value={cell[slot]}
                                onChange={(event) =>
                                  pushOperation({
                                    type: "set-blind-value",
                                    itemIndex: row.itemIndex,
                                    gameKind: cell.gameKind as GameKindId,
                                    slot,
                                    value: parseBlindValue(event.target.value),
                                  })
                                }
                                disabled={!snapshot.isEditable}
                                inputMode="numeric"
                                placeholder={slot.toUpperCase()}
                                className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-2 text-center text-zinc-500">
                            -
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditorState((prev) => editorUsecase.resetChanges(prev))}
              disabled={!snapshot.isDirty}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!snapshot.isEditable}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
