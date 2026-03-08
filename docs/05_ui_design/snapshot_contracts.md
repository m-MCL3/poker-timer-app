# Snapshot 契約

## 1. TimerSnapshot

Timer 画面に渡す表示モデルは次を基本とする。

```ts
export type TimerSnapshot = {
  titleText: string
  status: "idle" | "running" | "paused" | "finished"

  currentItemName: string
  currentItemIndexText: string
  remainingText: string

  showBreakBanner: boolean
  currentBlindGroups: SnapshotBlindGroup[]

  nextItemText: string
  nextBreakText: string

  canGoNext: boolean
  canGoPrevious: boolean
}
```

## 2. SnapshotBlindGroup

```ts
export type SnapshotBlindGroup = {
  gameKind: "fl" | "stud" | "nl" | "pl"
  values: {
    sb: string
    bb: string
    ante: string
  }
}
```

## 3. 表示ルール

- `remainingText` は Usecase で整形済みとする
- `nextBreakText` は `MM:SS` または `NO BREAK` などの表示可能文字列とする
- Break 中かどうかは `showBreakBanner` で判断する
- UI は `number | null` を直接整形しない

## 4. EditorSnapshot

Editor 画面の snapshot は次を含む。

- `title`
- `isDirty`
- `isEditable`
- `rows[]`

rows の各要素には、表示と編集に必要な派生情報を含める。
