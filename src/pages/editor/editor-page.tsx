import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLevels, useRepositories } from "@/app/providers/repositories-provider";
import type { LevelDef } from "@/entities/level";

function safeParseLevels(
  json: string
): { ok: true; levels: LevelDef[] } | { ok: false; error: string } {
  try {
    const obj = JSON.parse(json);

    if (!Array.isArray(obj)) {
      return { ok: false, error: "JSONは配列（LevelDef[]）である必要があります。" };
    }

    for (let i = 0; i < obj.length; i++) {
      const lv = obj[i];
      if (typeof lv?.durationSec !== "number") {
        return { ok: false, error: `levels[${i}].durationSec が数値ではありません。` };
      }
      if (!lv?.blinds?.fl || !lv?.blinds?.stud || !lv?.blinds?.nlpl) {
        return { ok: false, error: `levels[${i}].blinds が不正です（fl/stud/nlplが必要）。` };
      }
    }

    return { ok: true, levels: obj as LevelDef[] };
  } catch {
    return { ok: false, error: "JSONの構文が不正です。" };
  }
}

export default function EditorPage() {
  const navigate = useNavigate();
  const { levelRepository } = useRepositories();
  const { levels, setLevels } = useLevels();

  const initialText = useMemo(() => JSON.stringify(levels, null, 2), [levels]);

  const [text, setText] = useState(initialText);
  const [message, setMessage] = useState<string | null>(null);

  const onSave = () => {
    const parsed = safeParseLevels(text);
    if (!parsed.ok) {
      setMessage(`保存できません: ${parsed.error}`);
      return;
    }
    levelRepository.saveLevels(parsed.levels);
    setLevels(parsed.levels); // ✅ 共有状態を更新 → Timerに即反映
    setMessage("保存しました。");
  };

  const onResetFactory = () => {
    levelRepository.clearLevels();
    const newLevels = levelRepository.getLevels();
    setLevels(newLevels); // ✅ 即反映
    setText(JSON.stringify(newLevels, null, 2));
    setMessage("初期状態に戻しました。");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#e6edf3",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto',
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Editor（Levels JSON）</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #223047",
              background: "#0f172a",
              color: "#e6edf3",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Back
          </button>

          <button
            onClick={onResetFactory}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #223047",
              background: "#111827",
              color: "#e6edf3",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Factory Reset
          </button>

          <button
            onClick={onSave}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #2a3f63",
              background: "#16325c",
              color: "#e6edf3",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Save
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #223047",
            background: "#0f172a",
            opacity: 0.95,
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: "70vh",
            resize: "vertical",
            borderRadius: 14,
            border: "1px solid #223047",
            background: "#0f172a",
            color: "#e6edf3",
            padding: 14,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"',
            fontSize: 13,
            lineHeight: 1.4,
          }}
        />
      </div>

      <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
        ※ まずは “保存できる” を優先したJSON編集版。UIエディタ化は次でやる。
      </div>
    </div>
  );
}