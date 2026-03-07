# ADR-001: TournamentStructure を item 基準にする

## Status
Accepted

## Context
当初、Level を中心に structure を組み、Break を補助的に扱う設計が混在していた。  
その結果、手動 Next/Prev や表示で Break が飛ばされる不具合が生じた。

## Decision
TournamentStructure は `items: (LevelItem | BreakItem)[]` とする。  
Break を Level の例外ではなく、通常の item として扱う。

## Consequences
### 良い点
- 遷移単位が一貫する
- Editor / Timer の世界観が一致する
- 将来 item 種別追加に強い

### 悪い点
- 従来の level 中心命名を整理する必要がある
- `LEVEL n` のような表示は派生計算になる
