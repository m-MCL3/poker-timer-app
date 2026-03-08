# Blind モデル

## 1. 方針

ブラインド値はポーカーとして一般的な `sb / bb / ante` に統一する。  
Stud の `Bring-in / Complete` は UI 表示時だけ変換する。

## 2. GameKind

```ts
export type GameKind = "fl" | "stud" | "nl" | "pl"
```

## 3. BlindValues

```ts
export type BlindValues = {
  sb: number | null
  bb: number | null
  ante: number | null
}
```

## 4. BlindGroup

```ts
export type BlindGroup = {
  gameKind: GameKind
  values: BlindValues
}
```

## 5. 重要原則

- domain では `left / mid / right` のような抽象名を使わない
- domain では `sb / bb / ante` を標準語とする
- Stud の `Bring-in / Complete` は UI でだけ表現を変える
- 同一 Level 内で `gameKind` は重複させない

## 6. UI 表示との関係

表示時のラベルは次のように変換する。

- FL / NL / PL: `SB / BB / Ante`
- Stud: `Bring-in / Complete / Ante`

ただし、これは **表示ラベルだけ** の話であり、データ構造のキーは変えない。
