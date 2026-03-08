# タイマーエンジン

## 1. 基本方針

タイマーは epoch ms を基準として計算する。

理由

- タブ復帰時の整合性
- 描画周期に依存しない
- テストしやすい
- deterministic timer として扱いやすい

## 2. TimerRuntime

```ts
export type TimerRuntime = {
  status: "idle" | "running" | "paused" | "finished"
  currentIndex: number
  startedAtEpochMs: number | null
  endsAtEpochMs: number | null
  remainingMsWhenPaused: number | null
}
```

## 3. tick の意味

tick は現在時刻を受け取り、その時点の正しい状態へ Runtime を更新する処理である。  
1 秒ごとに remaining を減算する処理ではない。

## 4. 自動遷移

- running 中に `nowEpochMs >= endsAtEpochMs` になったら次 item へ進む
- 次 item が存在しなければ finished にする
- 遷移先は item 配列順に従う

## 5. 手動移動

- `goToNextItem`
- `goToPreviousItem`

どちらも Level / Break を同列 item として扱う。

## 6. reset

reset は structure を保持したまま、現在 item を先頭に戻して idle にする。
