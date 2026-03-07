# Screens

## 1. Timer Page

### 役割
- 実行中 structure の current item を表示する
- start / pause / resume を受け付ける
- Next / Prev / Reset を受け付ける

### 表示モデル
TimerPage は `TimerSnapshot` をもとに描画する。

### UI が知ってよいこと
- currentItemLabel
- currentItemNumber
- totalItemCount
- remainingMs
- showBreakBanner
- showCurrentBlinds
- nextItemText

### UI が知るべきでないこと
- blinds 表示のためにどの level を参照すべきか
- Break を飛ばすかどうか
- 遷移時に残り時間をどう調整するか

---

## 2. Editor Page

### 役割
- structure の編集
- Apply / Cancel
- Preset Save / Load / Rename / Delete

### 表示モデル
EditorPage は `EditorSnapshot` を描画する。

### row の意味
1 row = 1 item。  
Level も Break も同じ row として表示する。

---

## 3. Settings Page

現時点では詳細未確定。  
仕様化後に分離して記述する。
