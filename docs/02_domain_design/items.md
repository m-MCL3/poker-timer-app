# Items

## 1. TournamentStructureItem

TournamentStructureItem は次の discriminated union である。

- LevelItem
- BreakItem

## 2. LevelItem

LevelItem は少なくとも次を持つ。

- id
- kind = "level"
- durationMs
- blinds

### blinds
blinds は次の 3種を常に持つ。

- fl
- stud
- nlpl

各ゲーム種別は 3スロットを持つ。

- sb
- bb
- ante

### なぜ 3種固定なのか
現時点の仕様として、表示上 `fl / stud / nlpl` の枠自体は常に存在するため。  
概念として消さない。

## 3. BreakItem

BreakItem は次を持つ。

- id
- kind = "break"
- durationMs

Break は blinds を持たない。

## 4. id の役割

id は UI key や編集対象識別に使う。  
index のみだと挿入 / 削除時に不安定なため、id を持つ。

## 5. item label は domain に持たせない

`LEVEL 2` や `BREAK` といった表示文字列はドメインではなく表示用派生情報である。  
domain はあくまで item とその値を表す。
