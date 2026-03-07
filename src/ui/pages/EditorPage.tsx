import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContainer } from "@/app/composition/containerContext";
import type { EditOperation } from "@/domain/entities/editOperation";
import type { TournamentStructureItem } from "@/domain/entities/tournamentStructure";
import { GAME_KIND_ORDER, type GameKindId } from "@/domain/entities/blinds";
import {
  appendEditOperation,
  createEditorState,
  isEditorDirty,
  materializeEditorStructure,
  replaceEditorBaseStructure,
  resetEditorChanges,
  type EditorState,
} from "@/usecases/editor/editorUsecase";
import { replaceTournamentStructure } from "@/usecases/timer/timerUsecase";
import "./editor-table.css";

function minutesOf(durationMs: number): number {
  return Math.floor(durationMs / 60_000);
}

function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function displayNo(items: TournamentStructureItem[], itemIndex: number): string {
  let no = 0;

  for (let i = 0; i <= itemIndex; i += 1) {
    if (items[i].kind === "level") {
      no += 1;
    }
  }

  return items[itemIndex].kind === "break" ? "Break" : String(no);
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

  const draft = useMemo(
    () => materializeEditorStructure(editorState),
    [editorState],
  );
  const dirty = isEditorDirty(editorState);
  const readOnly = !editorState.isEditable;

  useEffect(() => {
    const unsubscribe = timerStore.subscribe(() => {
      const timerState = timerStore.getState();
      setEditorState((prev) =>
        createEditorState({
          structure: dirty ? materializeEditorStructure(prev) : timerState.structure,
          isEditable: timerState.status !== "running",
        }),
      );
    });

    return unsubscribe;
  }, [dirty, timerStore]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    void structureStorage.listNames().then(setSavedNames);
  }, [structureStorage]);

  function pushOperation(operation: EditOperation) {
    setEditorState((prev) => appendEditOperation({ state: prev, operation }));
  }

  function backWithGuard() {
    if (!dirty) {
      navigate("/");
      return;
    }

    const ok = confirm(
      "未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）",
    );
    if (!ok) {
      return;
    }

    setEditorState((prev) => resetEditorChanges(prev));
    navigate("/");
  }

  async function onSave() {
    if (readOnly) {
      return;
    }

    const name = saveName.trim();
    if (!name) {
      alert("保存名を入力してね。");
      return;
    }

    await structureStorage.save(name, draft);
    setSaveName("");
    setLoadName(name);
    setSavedNames(await structureStorage.listNames());
  }

  async function onLoad() {
    if (readOnly) {
      return;
    }

    const name = loadName.trim();
    if (!name) {
      alert("読み込む名前を選んでね。");
      return;
    }

    const loaded = await structureStorage.load(name);
    if (!loaded) {
      alert("読み込みに失敗しました。");
      return;
    }

    setEditorState((prev) =>
      replaceEditorBaseStructure({ state: prev, structure: loaded }),
    );
  }

  async function onDeletePreset() {
    if (readOnly) {
      return;
    }

    const name = loadName.trim();
    if (!name) {
      alert("削除するプリセットを選んでね。");
      return;
    }

    const ok = confirm(`プリセット「${name}」を削除します。よろしいですか？`);
    if (!ok) {
      return;
    }

    await structureStorage.remove(name);
    setLoadName("");
    setSavedNames(await structureStorage.listNames());
  }

  function onApply() {
    if (readOnly) {
      return;
    }

    try {
      timerStore.setState(
        replaceTournamentStructure({
          state: timerStore.getState(),
          structure: draft,
        }),
      );
      setEditorState((prev) =>
        createEditorState({
          structure: materializeEditorStructure(prev),
          isEditable: true,
        }),
      );
      navigate("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Apply failed.");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[980px] flex-col gap-4 px-4 py-6 text-zinc-50">
      <div>
        <h1 className="text-xl font-semibold">Edit Structure</h1>
        <p className="text-sm text-zinc-400">
          Editorは structure + operations のみを持ち、表示は常にそこから再構成します。
        </p>
      </div>

      {readOnly && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          running中は参照のみです。編集、保存、適用はできません。
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded-lg border px-3 py-2" onClick={backWithGuard}>
          ← Back
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            className="rounded-lg border bg-zinc-900 px-3 py-2"
            placeholder="保存名"
            value={saveName}
            onChange={(event) => setSaveName(event.target.value)}
            disabled={readOnly}
          />
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => void onSave()}
            disabled={readOnly}
          >
            Save
          </button>

          <select
            className="rounded-lg border bg-zinc-900 px-3 py-2"
            value={loadName}
            onChange={(event) => setLoadName(event.target.value)}
            disabled={readOnly}
          >
            <option value="">（保存済みを選択）</option>
            {savedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => void onLoad()}
            disabled={readOnly}
          >
            Load
          </button>
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => void onDeletePreset()}
            disabled={readOnly}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-900/90 text-zinc-300">
            <tr>
              <th className="px-3 py-2">＋ Level</th>
              <th className="px-3 py-2">＋ Break</th>
              <th className="px-3 py-2">－</th>
              <th className="px-3 py-2">No / Type</th>
              <th className="px-3 py-2">Min</th>
              {GAME_KIND_ORDER.map((kind) => (
                <th key={kind} className="px-3 py-2">
                  {kind.toUpperCase()} (SB / BB / Ante)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item, itemIndex) => (
              <tr key={item.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-center">
                  <button
                    className="rounded-md border px-2 py-1"
                    onClick={() =>
                      pushOperation({ type: "insert-level-after", itemIndex })
                    }
                    disabled={readOnly}
                    title="下にLevel挿入"
                  >
                    ＋
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    className="rounded-md border px-2 py-1"
                    onClick={() =>
                      pushOperation({ type: "insert-break-after", itemIndex })
                    }
                    disabled={readOnly}
                    title="下にBreak挿入"
                  >
                    ＋
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    className="rounded-md border px-2 py-1"
                    onClick={() =>
                      pushOperation({ type: "remove-item", itemIndex })
                    }
                    disabled={readOnly || draft.items.length <= 1}
                    title="この行を削除"
                  >
                    －
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block min-w-14 rounded-md bg-zinc-800 px-2 py-1 text-center">
                      {displayNo(draft.items, itemIndex)}
                    </span>
                    <select
                      className="rounded-md border bg-zinc-900 px-2 py-1"
                      value={item.kind}
                      onChange={(event) =>
                        pushOperation({
                          type: "change-item-kind",
                          itemIndex,
                          kind: event.target.value as "level" | "break",
                        })
                      }
                      disabled={readOnly}
                    >
                      <option value="level">Level</option>
                      <option value="break">Break</option>
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded-md border bg-zinc-900 px-2 py-1"
                    value={minutesOf(item.durationMs)}
                    onChange={(event) =>
                      pushOperation({
                        type: "set-duration-minutes",
                        itemIndex,
                        minutes: Number(event.target.value),
                      })
                    }
                    disabled={readOnly}
                    inputMode="numeric"
                  />
                </td>

                {GAME_KIND_ORDER.map((kind) => {
                  if (item.kind !== "level") {
                    return (
                      <td key={kind} className="px-3 py-2 text-zinc-500">
                        -
                      </td>
                    );
                  }

                  const triple = item.blinds[kind];

                  return (
                    <td key={kind} className="px-3 py-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          className="rounded-md border bg-zinc-900 px-2 py-1"
                          value={triple.sb ?? ""}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex,
                              gameKind: kind as GameKindId,
                              slot: "sb",
                              value: parseNullableNumber(event.target.value),
                            })
                          }
                          disabled={readOnly}
                          inputMode="numeric"
                          placeholder="SB"
                        />
                        <input
                          className="rounded-md border bg-zinc-900 px-2 py-1"
                          value={triple.bb ?? ""}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex,
                              gameKind: kind as GameKindId,
                              slot: "bb",
                              value: parseNullableNumber(event.target.value),
                            })
                          }
                          disabled={readOnly}
                          inputMode="numeric"
                          placeholder="BB"
                        />
                        <input
                          className="rounded-md border bg-zinc-900 px-2 py-1"
                          value={triple.ante ?? ""}
                          onChange={(event) =>
                            pushOperation({
                              type: "set-blind-value",
                              itemIndex,
                              gameKind: kind as GameKindId,
                              slot: "ante",
                              value: parseNullableNumber(event.target.value),
                            })
                          }
                          disabled={readOnly}
                          inputMode="numeric"
                          placeholder="Ante"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-lg border px-3 py-2"
          onClick={() => setEditorState((prev) => resetEditorChanges(prev))}
        >
          Cancel
        </button>
        <button
          className="rounded-lg border bg-zinc-100 px-3 py-2 text-zinc-900"
          onClick={onApply}
          disabled={readOnly}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
