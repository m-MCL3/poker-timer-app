import PageHeader from "@/ui/components/PageHeader";
import EditorTable from "@/ui/components/EditorTable";
import { useEditorPageModel } from "@/ui/hooks/useEditorPageModel";

function formatPresetLabel(preset: { name: string; updatedAtEpochMs: number }): string {
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
  const model = useEditorPageModel();

  return (
    <main className="app-shell editor-layout">
      <PageHeader
        eyebrow="Edit Structure"
        title={model.snapshot.title}
        description="行追加・Break切替・プリセット保存を含む編集責務を、ページから hook と service に分離しています。"
        actions={
          <div className="button-row">
            <button type="button" className="btn btn--ghost" onClick={model.onBack}>
              ← Back
            </button>
            <button
              type="button"
              className="btn"
              disabled={!model.snapshot.canUndo || !model.snapshot.isEditable}
              onClick={model.onUndo}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn"
              disabled={!model.snapshot.canRedo || !model.snapshot.isEditable}
              onClick={model.onRedo}
            >
              Redo
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!model.snapshot.isEditable}
              onClick={model.onApply}
            >
              Apply
            </button>
          </div>
        }
      />

      {!model.snapshot.isEditable ? (
        <div className="notice notice--warning">
          running中は参照のみです。構造を変更する場合はタイマーを停止してください。
        </div>
      ) : null}

      <section className="surface editor-toolbar">
        <h2 className="section-title">Structure Defaults</h2>
        <div className="toolbar-grid">
          <div className="field">
            <label htmlFor="structure-name">Structure Name</label>
            <input
              id="structure-name"
              value={model.snapshot.title}
              disabled={!model.snapshot.isEditable}
              onChange={(event) => model.onRenameStructure(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="default-level-duration">Default Level Minutes</label>
            <input
              id="default-level-duration"
              value={model.snapshot.defaultLevelDurationText}
              disabled={!model.snapshot.isEditable}
              onChange={(event) =>
                model.onChangeDefaultLevelDuration(event.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="default-break-duration">Default Break Minutes</label>
            <input
              id="default-break-duration"
              value={model.snapshot.defaultBreakDurationText}
              disabled={!model.snapshot.isEditable}
              onChange={(event) =>
                model.onChangeDefaultBreakDuration(event.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="surface editor-presets">
        <h2 className="section-title">Presets</h2>
        <div className="editor-presets__grid">
          <div className="field">
            <label htmlFor="preset-save-name">Save As</label>
            <input
              id="preset-save-name"
              value={model.saveName}
              disabled={!model.snapshot.isEditable}
              onChange={(event) => model.setSaveName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="preset-list">Stored Presets</label>
            <select
              id="preset-list"
              value={model.selectedPresetName}
              disabled={!model.snapshot.isEditable}
              onChange={(event) => model.setSelectedPresetName(event.target.value)}
            >
              <option value="">選択してください</option>
              {model.presetSummaries.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {formatPresetLabel(preset)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!model.snapshot.isEditable}
            onClick={model.onSavePreset}
          >
            Save
          </button>
          <button
            type="button"
            className="btn"
            disabled={!model.snapshot.isEditable}
            onClick={model.onLoadPreset}
          >
            Load
          </button>
          <button
            type="button"
            className="btn"
            disabled={!model.snapshot.isEditable}
            onClick={model.onRenamePreset}
          >
            Rename
          </button>
          <button
            type="button"
            className="btn btn--danger"
            disabled={!model.snapshot.isEditable}
            onClick={model.onDeletePreset}
          >
            Delete
          </button>
        </div>
      </section>

      <section className="surface editor-structure">
        <h2 className="section-title">Items</h2>
        <p className="text-muted">
          各行の「＋L」で下にLevel挿入、「＋B」で下にBreak挿入、「－」で行削除。TypeでLevel/Break切替。
        </p>
        <div className="button-row" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="btn"
            disabled={!model.snapshot.isEditable || !model.snapshot.isDirty}
            onClick={model.onResetChanges}
          >
            Discard Changes
          </button>
        </div>
        <EditorTable
          snapshot={model.snapshot}
          onInsertLevelAfter={model.onInsertLevelAfter}
          onInsertBreakAfter={model.onInsertBreakAfter}
          onRemoveItem={model.onRemoveItem}
          onSetItemKind={model.onSetItemKind}
          onSetItemDuration={model.onSetItemDuration}
          onSetBlind={model.onSetBlind}
        />
      </section>
    </main>
  );
}
