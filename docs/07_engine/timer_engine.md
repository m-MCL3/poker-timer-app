# Timer Engine

## 1. エンジンの目的

タイマーは見た目の更新とは独立して、**現在時刻から状態を再構成できること**が重要である。  
そのため本アプリのタイマーは deterministic engine として設計する。

---

## 2. deterministic とは何か

同じ `state` と同じ `nowEpochMs` を入力したとき、必ず同じ結果が得られること。  
内部で `Date.now()` を呼ばないことで、この性質を保つ。

---

## 3. 基本原理

### running
`endsAtEpochMs - nowEpochMs` により残り時間を導出する。

### paused
`pausedRemainingMs` をそのまま使う。

### idle
current item のフル duration を使う。

### finished
残り時間は 0 とみなす。

---

## 4. tick の責務

`tickTimer` は「1ステップ進める」のではなく、  
**現在時刻まで状態を追いつかせる**役割を持つ。

今後 `syncTimerState(state, nowEpochMs)` を明示関数として持つ構造へさらに寄せる余地はあるが、設計意図としては既に「時刻基準で追従する」ことが中心にある。

---

## 5. なぜ interval 減算方式にしないのか

1秒ごとに remaining を減らす方式だと次の問題が起きやすい。

- タブ非アクティブ時にずれる
- 複数 item またぎに弱い
- pause/resume の整合が崩れやすい
- テストがしにくい

そのため epoch ms 基準を採用している。

---

## 6. UI 再描画との関係

UI は定期的に現在時刻を更新し、その now を使って snapshot を再計算する。  
これにより state が変わらなくても残り時間表示を更新できる。
