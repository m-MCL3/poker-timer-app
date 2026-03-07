# States and Snapshots

## 1. なぜ分けるのか

内部の真実と表示の都合は別物である。  
そのため State と Snapshot を分ける。

## 2. TimerState

TimerState はタイマー実行中の内部状態であり、次を中心に持つ。

- structure
- status
- currentItemIndex
- endsAtEpochMs
- pausedRemainingMs

### TimerState の性質
- 実行のための状態
- UI 向け文言は持たない
- 現在時刻が与えられて初めて残り時間が解釈できる

## 3. EditorState

EditorState は編集状態であり、次を持つ。

- baseStructure
- operations
- isEditable

### EditorState の性質
- draft を直接持たない
- 編集差分を operations として持つ
- materialize により現在構造を再構成する

## 4. TimerSnapshot

Timer 画面向けの表示モデル。  
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

UI はこれを描画するだけにする。

## 5. EditorSnapshot

Editor 画面向け表示モデル。  
少なくとも次を持つ。

- title
- isDirty
- isEditable
- rows[]

rows の各 row は、1 item の表示・編集情報を持つ。

## 6. 原則

- State は振る舞いの基礎
- Snapshot は表示の基礎
- UI で State を直接こね回さない
