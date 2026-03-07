# Items

## 1. TournamentStructureItem

`TournamentStructureItem` は以下の discriminated union である。

- `LevelItem`
- `BreakItem`

---

## 2. LevelItem

```text
LevelItem
 ├ id: string
 ├ kind: "level"
 ├ durationMs: number
 └ blinds
    ├ fl
    ├ stud
    └ nlpl
```

### LevelItem が持つ意味
- durationMs: この level の長さ
- blinds: 各ゲーム種別の表示 / 進行用ブラインド情報

### blinds を 3種固定で持つ理由
現時点では UI と仕様上、常に `fl / stud / nlpl` を持つ。  
表示上消さないことが仕様であるため、存在しない概念として扱わない。

---

## 3. BreakItem

```text
BreakItem
 ├ id: string
 ├ kind: "break"
 └ durationMs: number
```

### BreakItem が blinds を持たない理由
Break 中に blinds を編集・表示する意味がないため。  
Break 表示は current item label と banner で表現する。

---

## 4. ID の役割

各 item の `id` は UI key や編集対象識別に使う。  
index ベースだけに依存すると、挿入 / 削除時に不安定になるため、id を持つ。

---

## 5. item label は domain に持たせない

`LEVEL 3` や `BREAK` のような表示文字列は domain の責務ではない。  
これらは usecase で item 配列から導出される。
