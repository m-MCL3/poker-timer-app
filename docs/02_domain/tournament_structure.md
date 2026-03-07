# TournamentStructure

## 1. 目的

`TournamentStructure` はトーナメント構造の唯一の真実である。  
タイマー構造を表す正規表現はこれだけにする。

UI 用、Editor 用、保存用などの都合で別構造を増やすと破綻しやすいため、派生情報は Snapshot や serialize/deserialize で扱う。

---

## 2. 概要

`TournamentStructure` は title と items を持つ。  
items は `LevelItem` または `BreakItem` の配列であり、実行順をそのまま表す。

```text
TournamentStructure
 ├ id
 ├ title
 ├ items: TournamentStructureItem[]
 ├ defaultLevelDurationMs
 └ defaultBreakDurationMs
```

---

## 3. items を配列で持つ理由

以前のように `levels[]` として持ち、Break を補助概念にすると、次の問題が起きやすい。

- Next/Prev で Break が飛ばされる
- 現在項目表示と実際の遷移対象がずれる
- Editor と Timer で扱う単位がずれる
- 将来 item 種別追加に弱い

そのため `items[]` に統一している。

---

## 4. default durations

`defaultLevelDurationMs` と `defaultBreakDurationMs` は Editor が新規挿入 item を作る際の初期値として使う。  
これは UI の都合ではなく、structure が編集操作に必要な既定値を持っているとみなす。

---

## 5. 設計原則

- structure は正規形である
- 表示用ラベルは structure に持たせない
- 派生情報は Snapshot で作る
- item 順序は配列順を真実とする
