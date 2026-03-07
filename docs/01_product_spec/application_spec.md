# Application Specification

## 1. 画面一覧

現時点で想定する主要画面は以下。

- Timer
- Editor
- Settings（詳細未確定）

本ドキュメントでは、現時点で確定している Timer / Editor を中心に扱う。

---

## 2. Timer 画面仕様

### 2.1 表示内容
Timer 画面には少なくとも以下を表示する。

- 現在の structure title
- 現在 item の順序番号
- 現在 item のラベル
- 現在 item の残り時間
- 現在タイマー状態
- 現在 item の blinds（Level の場合）
- Break バナー（Break の場合）
- 次 item 情報

### 2.2 操作
- 画面タップで start / pause / resume を切り替える
- メニューから reset できる
- メニューから前 / 次 item に移動できる
- メニューから Editor に遷移できることを想定する

### 2.3 自動遷移
- running 中に現在 item の残り時間が 0 になると、次 item に移行する
- 次 item がなければ finished になる
- ループはしない

### 2.4 手動遷移
- Previous Item で 1つ前の item に移動する
- Next Item で 1つ次の item に移動する
- Break を飛ばさない
- 手動移動時は移動先 item のフル時間から始まる
  - running 中ならフル時間で running
  - paused 中ならフル時間で paused
  - idle 中ならフル時間の idle

---

## 3. Editor 画面仕様

### 3.1 目的
現在タイマーが参照する `TournamentStructure` を編集する。

### 3.2 編集可能条件
- `timer.status !== "running"` のときのみ編集可能
- running 中は参照のみ

### 3.3 編集内容
各 row は 1つの item を表す。  
行ごとに次ができる。

- 下に Level を挿入
- 下に Break を挿入
- 行削除
- Level / Break 切替
- duration 編集
- Level の blinds 編集

### 3.4 Apply
Editor 上の構造を Timer 側に適用する。

適用時の基本方針

- TimerState は可能な限り維持する
- currentItemIndex は可能な範囲で維持する
- paused の残り時間は移動先 item の duration を超えない範囲で維持する
- running 中は適用不可

### 3.5 Cancel
- 未適用の operations を破棄する
- Editor を開いた時点の baseStructure に戻す
- 画面遷移はしない

### 3.6 離脱時警告
dirty 状態で戻るときは警告する。

---

## 4. Preset 仕様

### 4.1 Save Preset
- 現在 Editor で構築中の structure を保存する
- 名前入力必須
- 既存名なら上書き確認する

### 4.2 Load Preset
- 選択中のプリセットを読み込む
- 現在 dirty なら破棄確認する
- 読み込んだ preset は Timer 側にも即時反映する

### 4.3 Rename Preset
- 選択中 preset を対象とする
- `Rename Preset` ボタン押下でダイアログを開く
- 新しい名前を入力して rename する
- 既存名と重複したら失敗

### 4.4 Delete Preset
- 選択中 preset を削除する
- 確認ダイアログあり

---

## 5. 未確定事項

現時点では次は未確定または今後の拡張対象。

- 音通知の詳細仕様
- Settings 画面詳細
- export / import
- サーバ保存
