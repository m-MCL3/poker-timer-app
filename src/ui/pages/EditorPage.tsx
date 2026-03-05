import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useContainer } from "@/app/composition/containerContext";
import type { TimerDefinition, TimerEntry } from "@/domain/entities/timer";
import { GAME_KIND_ORDER, type GameKindId } from "@/domain/entities/blinds";

import "./editor-table.css";

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

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const emptyBlinds = () => ({
  fl: { sb: null, bb: null, ante: null },
  stud: { sb: null, bb: null, ante: null },
  nlpl: { sb: null, bb: null, ante: null },
});

export default function EditorPage() {
  const nav = useNavigate();
  const { timerUsecase, storage } = useContainer();

  const readOnly = !timerUsecase.canEditStructure();

  const [initial, setInitial] = useState<TimerDefinition>(() => timerUsecase.getDefinition());
  const [draft, setDraft] = useState<TimerDefinition>(() => timerUsecase.getDefinition());

  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadName, setLoadName] = useState<string>("");

  const dirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(draft), [initial, draft]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const refreshSavedNames = async () => {
    const listRaw = await storage.load(INDEX_KEY);
    setSavedNames(safeParseJson<string[]>(listRaw) ?? []);
  };

  useEffect(() => {
    void refreshSavedNames();
  }, []);

  const backWithGuard = () => {
    if (!dirty) {
      nav("/");
      return;
    }
    const ok = confirm("未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）");
    if (!ok) return;

    setDraft(deepClone(initial));
    nav("/");
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

  const onDeletePreset = async () => {
    if (readOnly) return;

    const name = loadName.trim();
    if (!name) {
      alert("削除するプリセットを選んでね。");
      return;
    }

    const ok = confirm(`プリセット「${name}」を削除します。よろしいですか？`);
    if (!ok) return;

    // StoragePortにremoveが無いので空で上書き（現段階の仮）
    await storage.save(DEF_KEY(name), "");

    const listRaw = await storage.load(INDEX_KEY);
    const list = safeParseJson<string[]>(listRaw) ?? [];
    const next = list.filter((x) => x !== name);
    await storage.save(INDEX_KEY, JSON.stringify(next));

    setLoadName("");
    await refreshSavedNames();
  };

  // ---- 編集ロジック ----
  const minutesOf = (ms: number) => Math.floor(ms / 60_000);

  const updateEntryDurationMin = (entryIndex: number, minutes: number) => {
    const durationMs = Math.max(0, Math.floor(minutes)) * 60_000;
    setDraft((prev) => {
      const next = deepClone(prev);
      next.entries[entryIndex].durationMs = durationMs;
      return next;
    });
  };

  const updateBlind = (entryIndex: number, kind: GameKindId, key: "sb" | "bb" | "ante", value: string) => {
    const trimmed = value.trim();
    const n = trimmed === "" ? null : Number(trimmed);
    const v = n === null ? null : Number.isFinite(n) ? (n as number) : null;

    setDraft((prev) => {
      const next = deepClone(prev);
      const e = next.entries[entryIndex];
      if (e.kind !== "level") return next;
      e.blinds[kind][key] = v;
      return next;
    });
  };

  const findNearestLevelBlinds = (entries: TimerEntry[], baseIndex: number) => {
    // まず直前
    for (let i = baseIndex; i >= 0; i--) {
      const e = entries[i];
      if (e.kind === "level") return deepClone(e.blinds);
    }
    // 次に直後
    for (let i = baseIndex + 1; i < entries.length; i++) {
      const e = entries[i];
      if (e.kind === "level") return deepClone(e.blinds);
    }
    return emptyBlinds();
  };

  const insertAfter = (entryIndex: number) => {
    setDraft((prev) => {
      const next = deepClone(prev);
      const blinds = findNearestLevelBlinds(next.entries, entryIndex);
      const newEntry: TimerEntry = {
        id: newId(),
        kind: "level",
        durationMs: next.defaultLevelDurationMs,
        blinds,
      };
      next.entries.splice(entryIndex + 1, 0, newEntry);
      return next;
    });
  };

  const removeAt = (entryIndex: number) => {
    setDraft((prev) => {
      const next = deepClone(prev);
      if (next.entries.length <= 1) return next; // 空は防ぐ
      next.entries.splice(entryIndex, 1);
      return next;
    });
  };

  const changeKind = (entryIndex: number, kind: "level" | "break") => {
    setDraft((prev) => {
      const next = deepClone(prev);
      const cur = next.entries[entryIndex];
      if (cur.kind === kind) return next;

      if (kind === "break") {
        next.entries[entryIndex] = { id: cur.id, kind: "break", durationMs: cur.durationMs };
        return next;
      }

      // break -> level は「近いlevelのブラインドコピー」で手間を減らす
      const blinds = findNearestLevelBlinds(next.entries, entryIndex - 1);
      next.entries[entryIndex] = {
        id: cur.id,
        kind: "level",
        durationMs: cur.durationMs,
        blinds,
      };
      return next;
    });
  };

  const displayNo = (entries: TimerEntry[], entryIndex: number): string => {
    // A: Breakは番号にカウントしない
    let no = 0;
    for (let i = 0; i <= entryIndex; i++) {
      if (entries[i].kind === "level") no++;
    }
    return entries[entryIndex].kind === "break" ? "Break" : String(no);
  };

  return (
    <div className="editor-page">
      <div className="editor-header" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="editor-title">Edit Structure</div>
          <div className="editor-sub">
            各行の「＋」で下にレベル挿入、「－」で行削除。Noセルのプルダウンで Level/Break 切替。
          </div>
          {readOnly && (
            <div className="editor-sub" style={{ color: "#a25" }}>
              running中は参照のみ（編集/保存/適用はできません）
            </div>
          )}
        </div>

        <button className="btn" onClick={backWithGuard}>
          ← Back
        </button>
      </div>

      <div className="box">
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Save / Load</div>
        <div className="row">
          <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="保存名" value={saveName} onChange={(e) => setSaveName(e.target.value)} disabled={readOnly} />
          <button className="btn" onClick={onSave} disabled={readOnly}>Save</button>

          <select className="select" value={loadName} onChange={(e) => setLoadName(e.target.value)} disabled={readOnly}>
            <option value="">（保存済みを選択）</option>
            {savedNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button className="btn" onClick={onLoad} disabled={readOnly}>Load</button>
          <button className="btn btn-danger" onClick={onDeletePreset} disabled={readOnly}>Delete</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="col-ops">+ / -</th>
              <th className="col-no">No / Type</th>
              <th className="col-min">Min</th>
              {GAME_KIND_ORDER.map((k) => (
                <th key={k} className="col-kind">{k.toUpperCase()} (SB / BB / Ante)</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {draft.entries.map((e, i) => (
              <tr key={e.id}>
                <td className="col-ops">
                  <div className="ops">
                    <button className="ops-btn" onClick={() => insertAfter(i)} disabled={readOnly} title="下にLevel挿入">＋</button>
                    <button className="ops-btn ops-btn-danger" onClick={() => removeAt(i)} disabled={readOnly || draft.entries.length <= 1} title="この行を削除">－</button>
                  </div>
                </td>

                <td className="col-no">
                  <div className="row" style={{ gap: 6 }}>
                    <div style={{ width: 44, fontWeight: 700 }}>{displayNo(draft.entries, i)}</div>
                    <select className="select" value={e.kind} onChange={(ev) => changeKind(i, ev.target.value as "level" | "break")} disabled={readOnly}>
                      <option value="level">Level</option>
                      <option value="break">Break</option>
                    </select>
                  </div>
                </td>

                <td className="col-min">
                  <input className="min" type="number" min={0} value={minutesOf(e.durationMs)} onChange={(ev) => updateEntryDurationMin(i, Number(ev.target.value))} disabled={readOnly} inputMode="numeric" />
                </td>

                {GAME_KIND_ORDER.map((k) => {
                  if (e.kind !== "level") return <td key={k} className="col-kind" style={{ color: "#777" }}>-</td>;

                  const t = e.blinds[k];
                  return (
                    <td key={k} className="col-kind">
                      <div className="cell3">
                        <input className="num" value={t.sb ?? ""} onChange={(ev) => updateBlind(i, k, "sb", ev.target.value)} disabled={readOnly} inputMode="numeric" placeholder="SB" />
                        <input className="num" value={t.bb ?? ""} onChange={(ev) => updateBlind(i, k, "bb", ev.target.value)} disabled={readOnly} inputMode="numeric" placeholder="BB" />
                        <input className="num" value={t.ante ?? ""} onChange={(ev) => updateBlind(i, k, "ante", ev.target.value)} disabled={readOnly} inputMode="numeric" placeholder="Ante" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="box">
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={backWithGuard}>Cancel</button>
          <button className="btn" onClick={onApply} disabled={readOnly}>Apply</button>
        </div>
      </div>
    </div>
  );
}