import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BlindSlot, GameKind } from "@/domain/entities/blinds";
import { useContainer } from "@/app/composition/containerContext";
import { usePromptBeforeUnload } from "@/ui/hooks/usePromptBeforeUnload";

export function useEditorPageModel() {
  const navigate = useNavigate();
  const { editorService, presetService, timerSessionService } = useContainer();
  const [draft, setDraft] = useState(() =>
    editorService.createDraft({
      structure: timerSessionService.getStructure(),
      isEditable: timerSessionService.isEditable(),
    }),
  );
  const [presetSummaries, setPresetSummaries] = useState<
    Array<{ name: string; updatedAtEpochMs: number }>
  >([]);
  const [saveName, setSaveName] = useState("");
  const [selectedPresetName, setSelectedPresetName] = useState("");

  useEffect(() => {
    return timerSessionService.subscribe(() => {
      setDraft((currentDraft) =>
        editorService.setEditable(currentDraft, timerSessionService.isEditable()),
      );
    });
  }, [editorService, timerSessionService]);

  const snapshot = useMemo(() => editorService.createSnapshot(draft), [draft, editorService]);

  usePromptBeforeUnload(snapshot.isDirty);

  useEffect(() => {
    void (async () => {
      setPresetSummaries(await presetService.list());
    })();
  }, [presetService]);

  async function refreshPresets(): Promise<void> {
    setPresetSummaries(await presetService.list());
  }

  return {
    snapshot,
    presetSummaries,
    saveName,
    selectedPresetName,
    setSaveName,
    setSelectedPresetName,
    onRenameStructure: (name: string) =>
      setDraft((currentDraft) => editorService.renameStructure(currentDraft, name)),
    onChangeDefaultLevelDuration: (text: string) =>
      setDraft((currentDraft) =>
        editorService.setDefaultLevelDuration(currentDraft, text),
      ),
    onChangeDefaultBreakDuration: (text: string) =>
      setDraft((currentDraft) =>
        editorService.setDefaultBreakDuration(currentDraft, text),
      ),
    onInsertLevelAfter: (itemIndex: number) =>
      setDraft((currentDraft) => editorService.insertLevelAfter(currentDraft, itemIndex)),
    onInsertBreakAfter: (itemIndex: number) =>
      setDraft((currentDraft) => editorService.insertBreakAfter(currentDraft, itemIndex)),
    onRemoveItem: (itemIndex: number) =>
      setDraft((currentDraft) => editorService.removeItem(currentDraft, itemIndex)),
    onSetItemKind: (itemIndex: number, nextKind: "level" | "break") =>
      setDraft((currentDraft) =>
        editorService.setItemKind(currentDraft, itemIndex, nextKind),
      ),
    onSetItemDuration: (itemIndex: number, text: string) =>
      setDraft((currentDraft) =>
        editorService.setItemDuration(currentDraft, itemIndex, text),
      ),
    onSetBlind: (
      itemIndex: number,
      gameKind: GameKind,
      slot: BlindSlot,
      text: string,
    ) =>
      setDraft((currentDraft) =>
        editorService.setBlind(currentDraft, itemIndex, gameKind, slot, text),
      ),
    onUndo: () => setDraft((currentDraft) => editorService.undo(currentDraft)),
    onRedo: () => setDraft((currentDraft) => editorService.redo(currentDraft)),
    onResetChanges: () =>
      setDraft((currentDraft) => editorService.resetChanges(currentDraft)),
    onBack: () => {
      if (!snapshot.isDirty) {
        navigate("/");
        return;
      }

      const accepted = window.confirm(
        "未適用の変更があります。破棄して戻りますか？（戻る＝キャンセル扱い）",
      );
      if (!accepted) {
        return;
      }

      setDraft((currentDraft) => editorService.resetChanges(currentDraft));
      navigate("/");
    },
    onApply: () => {
      if (!snapshot.isEditable) {
        return;
      }

      try {
        const structure = editorService.materializeStructure(draft);
        timerSessionService.applyStructure(structure);
        setDraft((currentDraft) =>
          editorService.replaceBaseStructure(currentDraft, structure),
        );
        navigate("/");
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Apply failed.");
      }
    },
    onSavePreset: async () => {
      if (!snapshot.isEditable) {
        return;
      }

      const normalizedName = presetService.normalizeName(saveName);
      const validationError = presetService.validateName(normalizedName);
      if (validationError) {
        window.alert(validationError);
        return;
      }

      if (presetService.hasPreset(presetSummaries, normalizedName)) {
        const accepted = window.confirm(
          `プリセット「${normalizedName}」は既に存在します。上書きしますか？`,
        );
        if (!accepted) {
          return;
        }
      }

      await presetService.save(
        normalizedName,
        editorService.materializeStructure(draft),
      );
      setSaveName("");
      setSelectedPresetName(normalizedName);
      await refreshPresets();
    },
    onLoadPreset: async () => {
      if (!snapshot.isEditable) {
        return;
      }

      const normalizedName = presetService.normalizeName(selectedPresetName);
      if (!normalizedName) {
        window.alert("読み込むプリセットを選択してください。");
        return;
      }

      if (snapshot.isDirty) {
        const accepted = window.confirm(
          "未適用の変更があります。破棄してプリセットを読み込みますか？",
        );
        if (!accepted) {
          return;
        }
      }

      const loaded = await presetService.load(normalizedName);
      if (!loaded) {
        window.alert("プリセットの読み込みに失敗しました。");
        return;
      }

      try {
        timerSessionService.loadPresetStructure(loaded);
        setDraft((currentDraft) =>
          editorService.replaceBaseStructure(currentDraft, loaded),
        );
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "プリセットの適用に失敗しました。",
        );
      }
    },
    onRenamePreset: async () => {
      if (!snapshot.isEditable) {
        return;
      }

      const currentName = presetService.normalizeName(selectedPresetName);
      if (!currentName) {
        window.alert("リネームするプリセットを選択してください。");
        return;
      }

      const inputName = window.prompt(
        `プリセット「${currentName}」の新しい名前を入力してください。`,
        currentName,
      );
      if (inputName === null) {
        return;
      }

      const nextName = presetService.normalizeName(inputName);
      const validationError = presetService.validateName(nextName);
      if (validationError) {
        window.alert(validationError);
        return;
      }

      if (presetService.hasPreset(presetSummaries, nextName)) {
        window.alert(`プリセット「${nextName}」は既に存在します。`);
        return;
      }

      await presetService.rename(currentName, nextName);
      setSelectedPresetName(nextName);
      await refreshPresets();
    },
    onDeletePreset: async () => {
      if (!snapshot.isEditable) {
        return;
      }

      const normalizedName = presetService.normalizeName(selectedPresetName);
      if (!normalizedName) {
        window.alert("削除するプリセットを選択してください。");
        return;
      }

      const accepted = window.confirm(
        `プリセット「${normalizedName}」を削除します。よろしいですか？`,
      );
      if (!accepted) {
        return;
      }

      await presetService.delete(normalizedName);
      setSelectedPresetName("");
      await refreshPresets();
    },
  };
}
