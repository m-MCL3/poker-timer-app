# Editor Usecases

## 1. 役割

EditorUsecase は EditorState を扱い、baseStructure と operations から現在構造と表示情報を導出する。

## 2. なぜ draft を直接持たないのか

draft 構造を直接 mutation すると、次の問題が起きやすい。

- Cancel が不安定
- dirty 判定が曖昧
- 差分が見えない
- 変更責務が UI に漏れる

そのため、Editor は次を真実として持つ。

- baseStructure
- operations

## 3. 主な関数

### createEditorState
Editor 初期状態を作る。

### appendEditOperation
編集差分を 1件追加する。

### materializeEditorStructure
baseStructure に operations を適用して現在構造を作る。

### isEditorDirty
operations の有無から dirty 判定する。

### replaceEditorBaseStructure
新しい構造を base にし、operations をクリアする。

### resetEditorChanges
operations を破棄する。

### createEditorSnapshot
UI 向け row 情報を作る。

## 4. operation 種類

- insert-level-after
- insert-break-after
- remove-item
- change-item-kind
- set-duration-minutes
- set-blind-value

## 5. 適用タイミング

- 編集中: operation を積むだけ
- Apply: materialize した structure を Timer に適用
- Load Preset: preset 構造を Timer に即時適用し、Editor base を同期
