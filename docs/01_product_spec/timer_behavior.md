# Timer Behavior

## 1. TimerState

TimerState は以下のいずれか。

- `idle`
- `running`
- `paused`
- `finished`

---

## 2. 状態意味

### idle
まだ開始していない状態。  
表示時間は current item のフル duration。

### running
現在 item の終了時刻 `endsAtEpochMs` が設定され、残り時間が進行している状態。

### paused
現在 item の残り時間が `pausedRemainingMs` に固定された状態。

### finished
structure の最終 item 終了後の状態。

---

## 3. start / pause / resume

### idle → running
現在 item のフル時間で開始する。

### running → paused
その時点の残り時間を計算し、`pausedRemainingMs` に保持する。

### paused → running
`pausedRemainingMs` を基準に再開する。

### finished → toggle
現在実装では `createInitialTimerState(structure)` に戻す。

---

## 4. tick の考え方

タイマーは `tickTimer({ state, nowEpochMs })` によって進む。  
内部では実時間差分を使って残り時間を計算する。

重要なのは、状態を「1秒ごとに減算」しているのではなく、  
**現在時刻を与えて再評価している**こと。

この方針により、ブラウザが一時停止しても次回 tick 時に整合が取りやすい。

---

## 5. Break の扱い

Break は特殊ケースではなく item の一種。  
そのため次が成り立つ。

- 自動遷移対象になる
- 手動 Next/Prev の対象になる
- current item として表示される
- next item 表示にも現れる

---

## 6. finished の扱い

最後の item 終了時に status は `finished` になる。  
finished 後に start を押したときの扱いは UI で曖昧になりやすいため、今後仕様の明文化余地があるが、現行ロジックでは toggle により初期状態へ戻る。
