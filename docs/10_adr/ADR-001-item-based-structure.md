# ADR-001: TournamentStructure を item 基準にする

## Status
Accepted

## Context
当初、Level 中心の設計と Break 補助扱いの発想が混在していた。
その結果、手動 Next/Prev や表示で Break が飛ばされる不具合が発生した。

## Decision
TournamentStructure は `items: (LevelItem | BreakItem)[]` とする。
Break を Level の例外ではなく、通常 item として扱う。

## Consequences

### 良い点
- 遷移単位が一貫する
- Editor / Timer の世界観が一致する
- 将来 item 種別追加に強い

### 悪い点
- `LEVEL n` などの表示は派生計算になる
- 旧 level 中心命名の整理が必要になる
