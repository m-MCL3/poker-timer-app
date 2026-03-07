# Editor Usecases

## 1. 役割

EditorUsecase は `baseStructure + operations` から、現在編集中の構造や UI 表示情報を生成する責務を持つ。

---

## 2. なぜ draft を直接持たないのか

直接 draft 構造を state に持つと、次の問題が起きやすい。

- 変更履歴が見えにくい
- Cancel が不安定になる
- 編集途中の責務が UI に漏れる
- 差分ベースの扱いが難しい

そのため、Editor は次で構成する。

```text
EditorState
 ├ baseStructure
 ├ operations[]
 └ isEditable
```

---

## 3. materialize の考え方

`materializeEditorStructure(state)` は

- baseStructure に対して
- operations を順に適用し
- 現在の構造を得る

という関数である。

Editor の真実は draft オブジェクトではなく、  
**baseStructure と operations の組み合わせ**にある。

---

## 4. 主な関数

### createEditorState
Editor 初期状態を作る。

### appendEditOperation
1件の編集操作を積む。

### materializeEditorStructure
現在の編集結果 structure を生成する。

### isEditorDirty
operations が存在するかどうかで dirty 判定する。

### replaceEditorBaseStructure
新しい baseStructure へ差し替え、operations をクリアする。

### resetEditorChanges
未適用 changes を破棄する。

### createEditorSnapshot
UI 向け row 情報を生成する。

---

## 5. EditOperation の種類

現時点では次を扱う。

- insert-level-after
- insert-break-after
- remove-item
- change-item-kind
- set-duration-minutes
- set-blind-value

---

## 6. 適用タイミング

- row 編集中: operation を積むだけ
- Apply: materialize した structure を Timer に反映
- Load Preset: 読み込んだ structure を Timer に反映し、Editor base も同期
