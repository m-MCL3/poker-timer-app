# States and Snapshots

## 1. なぜ State と Snapshot を分けるのか

アプリでは「内部の真実」と「画面表示の都合」を分ける必要がある。  
そのため、内部状態は State、表示用派生情報は Snapshot として扱う。

---

## 2. TimerState

`TimerState` はタイマー実行中の内部状態であり、少なくとも以下を持つ。

- structure
- status
- currentItemIndex
- endsAtEpochMs
- pausedRemainingMs

### TimerState の性質
- 実行状態を表す
- UI 文言は持たない
- 時刻依存情報は nowEpochMs を与えて解釈する

---

## 3. EditorState

`EditorState` は編集状態であり、次を持つ。

- baseStructure
- operations
- isEditable

### EditorState の性質
- 編集前の真実を baseStructure として持つ
- 実際の変更は operations に蓄積する
- draft 構造は materialize 時に生成する

---

## 4. TimerSnapshot

Timer 画面向け表示モデル。  
少なくとも次を持つ。

- title
- status
- currentItemNumber
- totalItemCount
- currentItemLabel
- remainingMs
- showBreakBanner
- showCurrentBlinds
- currentBlindGroups
- nextItemText

UI はこの snapshot を描画するだけにする。

---

## 5. EditorSnapshot

Editor 画面向け表示モデル。  
少なくとも次を持つ。

- title
- isDirty
- isEditable
- rows[]

row は current item の表示情報と編集情報を持つ。

---

## 6. 重要な境界

- State はドメイン操作の基礎
- Snapshot は UI 表示の基礎

UI 側で State を直接解釈し始めると責務が崩れるため、表示判断は Snapshot に寄せる。
