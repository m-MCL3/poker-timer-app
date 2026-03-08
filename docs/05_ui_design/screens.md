# 画面設計

## 1. 画面一覧

- Timer
- Editor
- Settings（詳細未確定）

## 2. Timer 画面

表示責務

- 現在 item
- 残り時間
- status
- current blindGroups
- next item
- 次の Break まで
- 操作ボタン

UI は Snapshot を描画するだけにする。  
状態計算や次 Break 算出は Usecase 側で行う。

## 3. Editor 画面

表示責務

- item row 一覧
- row ごとの種別、名称、duration、blindGroups
- dirty 状態
- Apply / Cancel
- Preset 関連操作

Editor は `EditorSnapshot` を描画し、編集指示は operation として Usecase に渡す。

## 4. Settings 画面

現時点では詳細未確定。  
音通知、表示設定、デフォルト値などを将来対象とする。

## 5. UI の共通原則

- UI は Runtime を直接解釈しない
- UI は timerStore や repository を直接触らない
- UI は Snapshot / Usecase API に揃える
- Stud の表記差分は UI 表示時のみ変換する
