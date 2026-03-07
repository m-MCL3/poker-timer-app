# Editor Behavior

## 1. Editor の目的

Editor は現在タイマーが参照する TournamentStructure を編集するための画面である。

## 2. 編集可能条件

- `timer.status !== "running"` のときのみ編集可能
- running 中は参照のみ

## 3. 行の意味

Editor の 1 row は 1 item を表す。  
Level も Break も同じ row として表示する。

## 4. 編集できる内容

- 下に Level を挿入
- 下に Break を挿入
- 現在 row を削除
- item 種別を level / break に変更
- duration を変更
- level の blinds を変更

## 5. Apply

Apply は Editor 上の現在構造を Timer に適用する。

方針
- structure は新しいものへ差し替える
- running 中は適用不可
- paused の残り時間は現在 item duration を超えない範囲で維持する
- currentItemIndex は可能な限り維持する

## 6. Cancel

- 未適用の operations を破棄する
- baseStructure に戻る
- 画面は維持する

## 7. 離脱時警告

dirty 状態で戻る場合は警告する。
OK なら変更を破棄し、Cancel なら Editor に留まる。

## 8. Preset 読み込みとの関係

- Load Preset 時に dirty なら破棄確認する
- 読み込んだ preset は Timer に即時反映する
- Editor の baseStructure も適用後構造に同期する
