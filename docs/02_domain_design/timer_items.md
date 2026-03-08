# TimerItem

## 1. TimerItem

`TimerItem` は次の discriminated union である。

- `LevelItem`
- `BreakItem`

## 2. 共通型

```ts
export type TimerItemBase = {
  id: string
  kind: "level" | "break"
  name: string
  durationSec: number
}
```

## 3. LevelItem

```ts
export type LevelItem = TimerItemBase & {
  kind: "level"
  blindGroups: BlindGroup[]
}
```

方針

- Level にのみ blindGroups を持たせる
- blindGroups は `gameKind` ごとの値配列とする
- item label は domain に持たせない

## 4. BreakItem

```ts
export type BreakItem = TimerItemBase & {
  kind: "break"
}
```

Break は blinds を持たない。

## 5. id の役割

id は UI key や編集対象識別に使う。  
index のみだと挿入 / 削除時に不安定なため、id を持つ。

## 6. item label は domain に持たせない

`LEVEL 2` や `BREAK` といった表示文字列は domain ではなく表示用派生情報である。  
domain はあくまで item とその値を表す。
