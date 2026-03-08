# ADR-006 Structure / Runtime / Snapshot を分離する

## 決定
`TimerStructure`、`TimerRuntime`、`TimerSnapshot` は別モデルとする。

## 理由
- 保存と進行と表示の責務が異なる
- UI が Runtime を直接こね回すのを防げる
- docs とコードの境界が明確になる

## 結果
UI は Snapshot を描画し、Usecase が変換を担当する。
