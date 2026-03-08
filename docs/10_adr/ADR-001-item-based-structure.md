# ADR-001 item ベース構造を採用する

## 決定
Level と Break を別配列ではなく、`TimerItem[]` で統一する。

## 理由
- 実行順をそのまま表現できる
- Next / Prev の単位が自然になる
- Editor の挿入 / 削除 / 種別変更が単純になる
- Break を補助概念にしない

## 結果
Timer / Editor / Snapshot / next break 計算の前提が一致する。
