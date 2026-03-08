# ADR-002 deterministic timer を採用する

## 決定
タイマー進行は epoch ms 基準で整合を取る deterministic timer とする。

## 理由
- タブ復帰に強い
- 描画周期の揺れに依存しない
- テストしやすい
- `tick = 現在時刻に追いつかせる処理` として定義できる

## 結果
`endsAtEpochMs` を中心に状態更新を設計する。
