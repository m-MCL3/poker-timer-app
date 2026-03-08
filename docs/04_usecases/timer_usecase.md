# TimerUsecase

## 1. 役割

TimerUsecase は `TimerRuntime` と `TimerStructure` と `nowEpochMs` を扱い、  
新しい Runtime または UI 用 Snapshot を返す。

## 2. 基本方針

Usecase は可能な限り次の形にそろえる。

- input → newRuntime
- input → snapshot

これによりテストしやすく、UI 非依存になる。

## 3. 主要 API

```ts
export interface TimerUsecase {
  getSnapshot(): TimerSnapshot
  subscribe(listener: () => void): () => void

  start(): void
  pause(): void
  toggle(): void
  reset(): void

  goToNextItem(): void
  goToPreviousItem(): void

  loadStructure(structure: TimerStructure): void
}
```

## 4. 主な関数責務

- `start`: 現在 item のフル時間で running を開始
- `pause`: running を paused にし、その時点の残り時間を保持
- `resume`: paused の残り時間を基準に running を再開
- `toggle`: status に応じて start / pause / resume / reset 的挙動を切替
- `tick`: 現在時刻に追いつかせる
- `goToNextItem / goToPreviousItem`: item 単位で移動
- `loadStructure`: 新 structure を Timer に適用
- `createSnapshot`: UI 表示用に整形

## 5. 重要な考え方

tick は「remaining を 1 秒減らす処理」ではない。  
**現在時刻を与えて、その時点の正しい状態に追いつかせる処理**である。

## 6. Break の扱い

Break は遷移対象 item の一つであり、特別扱いしない。  
特別なのは表示だけであり、Usecase 内では `item.kind` により snapshot の表示フラグを決める。

## 7. 次の Break まで

「次の Break まで」は Usecase が算出し、Snapshot に text として渡す。  
UI 側で item 配列を走査して計算しない。
