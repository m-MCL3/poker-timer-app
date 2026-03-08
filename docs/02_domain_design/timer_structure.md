# TimerStructure

## 1. 位置づけ

`TimerStructure` は、このアプリにおけるタイマー構造の唯一の真実である。  
タイマー構造の正規表現はこれだけとする。

## 2. 定義

```ts
export type TimerStructure = {
  id: string
  name: string
  items: TimerItem[]
  defaultLevelDurationSec: number
  defaultBreakDurationSec: number
}
```

## 3. items の意味

`items` は実行順そのものを表す配列である。  
配列順がトーナメント進行順であり、別の順序情報は持たない。

## 4. なぜ levels[] ではなく items[] なのか

以前の level 中心構造では Break が補助扱いになりやすく、次の問題が生じた。

- Next / Prev で Break が飛ばされる
- 表示と遷移単位がずれる
- Editor と Timer の前提が一致しない
- 将来 item 種別追加に弱い

そのため、現在は Level / Break をまとめて `items[]` に統一する。

## 5. default durations の役割

Editor で新しい item を追加するときの初期値として使う。  
これは UI の見た目都合ではなく、「structure が編集時の既定値を持つ」と考える。

## 6. 重要原則

- structure は正規形
- 表示ラベルは structure に持たせない
- 項目番号や `LEVEL 3` などの表示は派生情報である
- 派生情報は Usecase / Snapshot で生成する
