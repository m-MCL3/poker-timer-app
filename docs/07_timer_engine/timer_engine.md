# Timer Engine

## 1. 目的

タイマーは見た目の更新よりも、**現在時刻から正しい状態を導けること**が重要である。  
そのため本アプリでは deterministic timer を採用する。

## 2. deterministic とは何か

同じ state と同じ nowEpochMs を入力したとき、常に同じ結果が返ること。  
Usecase 内で `Date.now()` を直接使わないことで、この性質を保つ。

## 3. 時間計算

### running
残り時間は `endsAtEpochMs - nowEpochMs` で求める。

### paused
`pausedRemainingMs` を使う。

### idle
current item のフル duration を使う。

### finished
残り時間は 0 とみなす。

## 4. tickTimer の役割

tickTimer は 1秒ごとに値を減算する処理ではない。  
現在時刻を入力として、その時点の正しい状態に追いつかせる処理である。

## 5. epoch ms 基準の利点

- タブ非アクティブでずれにくい
- pause / resume の整合が取りやすい
- 長時間放置後の復帰に強い
- テストしやすい
- 将来的な同期処理にも寄せやすい

## 6. UI 再描画との関係

UI は一定間隔で nowEpochMs を更新し、その now で snapshot を再計算する。  
これにより state が変わらなくても残り時間表示を更新できる。
