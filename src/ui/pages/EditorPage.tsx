import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useContainer } from "@/app/composition/containerContext";
import type { TimerDefinition } from "@/domain/entities/timer";
import { GAME_KIND_ORDER, type GameKindId } from "@/domain/entities/blinds";

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const INDEX_KEY = "pokerTimer:structures:index";
const DEF_KEY = (name: string) => `pokerTimer:structures:${name}`;

function safeParseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export default function EditorPage() {
  const nav = useNavigate();
  const { timerUsecase, storage } = useContainer();

  const readOnly = !timerUsecase.canEditStructure();

  const [initial, setInitial] = useState<TimerDefinition>(() => timerUsecase.getDefinition());
  const [draft, setDraft] = useState<TimerDefinition>(() => timerUsecase.getDefinition());

  // 保存済み一覧
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadName, setLoadName] = useState<string>("");

  const dirty = useMemo(() => {
    return JSON.stringify(initial) !== JSON.stringify(draft);
  }, [initial, draft]);

  useEffect(() => {
    // ページ再読み込み/タブ閉じ対策
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    (async () => {
      const listRaw = await storage.load(INDEX_KEY);
      const list = safeParseJson<string[]>(listRaw) ?? [];
      setSavedNames(list);
    })();
  }, [storage]);

  const backWithGuard = () => {
    if (!dirty) {
      nav("/");
      return;
    }
    const ok = confirm("未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）");
    if (!ok) return;

    // キャンセル扱い：編集前に戻す
    setDraft(deepClone(initial));
    nav("/");
  };

  const updateLevelDurationMin = (levelIndex: number, minutes: number) => {
    const durationMs = Math.max(0, Math.floor(minutes)) * 60_000;
    setDraft((prev) => {
      const next = deepClone(prev);
      next.levels[levelIndex].durationMs = durationMs;
      return next;
    });
  };

  const updateBlind = (
    levelIndex: number,
    kind: GameKindId,
    key: "sb" | "bb" | "ante",
    value: string
  ) => {
    const n = value.trim() === "" ? null : Number(value);
    const v = Number.isFinite(n) ? (n as number) : null;

    setDraft((prev) => {
      const next = deepClone(prev);
      next.levels[levelIndex].blinds[kind][key] = v;
      return next;
    });
  };

  const onApply = () => {
    if (readOnly) return;

    try {
      timerUsecase.applyEditedDefinition(draft);
      const applied = timerUsecase.getDefinition();
      setInitial(applied);
      setDraft(applied);
      nav("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Apply failed.");
    }
  };

  const onCancel = () => {
    backWithGuard();
  };

  const refreshSavedNames = async () => {
    const listRaw = await storage.load(INDEX_KEY);
    setSavedNames(safeParseJson<string[]>(listRaw) ?? []);
  };

  const onSave = async () => {
    if (readOnly) return;
    const name = saveName.trim();
    if (!name) {
      alert("保存名を入力してね。");
      return;
    }

    await storage.save(DEF_KEY(name), JSON.stringify(draft));

    const listRaw = await storage.load(INDEX_KEY);
    const list = safeParseJson<string[]>(listRaw) ?? [];
    const next = Array.from(new Set([...list, name])).sort((a, b) => a.localeCompare(b));
    await storage.save(INDEX_KEY, JSON.stringify(next));

    setSaveName("");
    await refreshSavedNames();
    setLoadName(name);
    alert(`保存しました: ${name}`);
  };

  const onLoad = async () => {
    if (readOnly) return;
    const name = loadName.trim();
    if (!name) {
      alert("読み込む名前を選んでね。");
      return;
    }
    const raw = await storage.load(DEF_KEY(name));
    const loaded = safeParseJson<TimerDefinition>(raw);
    if (!loaded) {
      alert("読み込みに失敗しました（データが壊れているか、存在しません）。");
      return;
    }

    setDraft(deepClone(loaded));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[980px] px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Edit Structure</div>
            {readOnly ? (
              <div className="mt-1 text-xs text-amber-300">
                running中は参照のみ（編集/保存/適用はできません）
              </div>
            ) : (
              <div className="mt-1 text-xs text-zinc-400">
                適用すると「現在のタイマ構成」に反映され、そこから再開できます（running中は不可）
              </div>
            )}
          </div>

          <button
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs"
            onClick={backWithGuard}
          >
            ← Back
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-zinc-300">Save/Load</div>

            <input
              className="w-56 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs"
              placeholder="保存名（例: JOPT 10Game）"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              disabled={readOnly}
            />
            <button
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs disabled:opacity-50"
              onClick={onSave}
              disabled={readOnly}
            >
              Save
            </button>

            <select
              className="w-56 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs"
              value={loadName}
              onChange={(e) => setLoadName(e.target.value)}
              disabled={readOnly}
            >
              <option value="">（保存済みを選択）</option>
              {savedNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs disabled:opacity-50"
              onClick={onLoad}
              disabled={readOnly}
            >
              Load
            </button>

            {dirty && <div className="ml-auto text-xs text-amber-300">未適用の変更あり</div>}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[980px] border-collapse bg-zinc-950/30 text-xs">
            <thead className="bg-zinc-950/70 text-zinc-200">
              <tr>
                <th className="border-b border-zinc-800 px-3 py-2 text-left">Lv</th>
                <th className="border-b border-zinc-800 px-3 py-2 text-left">Minutes</th>
                {GAME_KIND_ORDER.map((k) => (
                  <th key={k} className="border-b border-zinc-800 px-3 py-2 text-left">
                    {k.toUpperCase()} (SB / BB / Ante)
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {draft.levels.map((lvl, i) => (
                <tr key={i} className="odd:bg-zinc-950/10">
                  <td className="border-b border-zinc-800 px-3 py-2 text-zinc-300">
                    {i + 1}
                  </td>

                  <td className="border-b border-zinc-800 px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs"
                      value={Math.floor(lvl.durationMs / 60_000)}
                      onChange={(e) => updateLevelDurationMin(i, Number(e.target.value))}
                      disabled={readOnly}
                    />
                  </td>

                  {GAME_KIND_ORDER.map((k) => {
                    const t = lvl.blinds[k];
                    return (
                      <td key={k} className="border-b border-zinc-800 px-3 py-2">
                        <div className="flex gap-2">
                          <input
                            className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs"
                            value={t.sb ?? ""}
                            onChange={(e) => updateBlind(i, k, "sb", e.target.value)}
                            disabled={readOnly}
                            placeholder="SB"
                          />
                          <input
                            className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs"
                            value={t.bb ?? ""}
                            onChange={(e) => updateBlind(i, k, "bb", e.target.value)}
                            disabled={readOnly}
                            placeholder="BB"
                          />
                          <input
                            className="w-20 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs"
                            value={t.ante ?? ""}
                            onChange={(e) => updateBlind(i, k, "ante", e.target.value)}
                            disabled={readOnly}
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

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-xs"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="rounded-xl border border-zinc-800 bg-zinc-200 px-4 py-2 text-xs text-zinc-950 disabled:opacity-50"
            onClick={onApply}
            disabled={readOnly}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}