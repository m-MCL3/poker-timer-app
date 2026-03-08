# ADR-003 Editor は operation model を採用する

## 決定
Editor は draft 構造を直接 mutation せず、`baseStructure + operations` で表現する。

## 理由
- Cancel を安定させたい
- dirty 判定を明確にしたい
- 差分を追いやすい
- 編集責務を UI に漏らしたくない

## 結果
Apply 時に materialize した structure を Timer へ渡す。
