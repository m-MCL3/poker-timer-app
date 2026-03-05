# Editor Specification

## 目的

現在タイマが参照している BlindStructure を編集する。

---

## 初期表示

- 現在の BlindStructure を表示
- ロード未実行の場合はデフォルト構造

---

## 編集可能条件

timer.state !== "running"

running中は参照のみ。

---

## Apply

- TimerState は維持
- currentLevelIndex は維持
- 残り時間は原則維持
- ただし現在レベルの残り時間を編集した場合は

    newRemaining = min(oldRemaining, editedRemaining)

延長は許可しない。

---

## Cancel

- 編集開始時点へ戻す
- 画面は維持

---

## Save

- 適用済み BlindStructure のみ保存可能

---

## Load

- draft に反映
- Timer 本体には Apply まで反映しない

---

## 未適用離脱警告

dirty状態で画面離脱する場合、

未適用の変更があります。破棄しますか？

OK → 破棄して戻る  
Cancel → Editorに留まる

---

## 永続化

現状: LocalStorage  
将来: Server Repository