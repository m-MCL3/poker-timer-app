# Timer Behavior

## 1. TimerState

TimerState は次のいずれかを取る。

- `idle`
- `running`
- `paused`
- `finished`

## 2. 各状態の意味

### idle
まだ開始していない状態。  
表示時間は current item のフル duration になる。

### running
現在 item が進行中である。  
残り時間は `endsAtEpochMs` と `nowEpochMs` の差から計算される。

### paused
一時停止中。  
残り時間は `pausedRemainingMs` として保持される。

### finished
structure の最後の item が終了した状態。

## 3. 基本挙動

- idle で start すると running になる
- running で pause すると paused になる
- paused で resume すると running になる
- running 中に current item の残り時間が 0 になると次 item に自動遷移する
- 最終 item 終了時は finished になる
- finished で toggle したときの扱いは現行実装では初期状態へ戻す

## 4. 手動移動

### Next Item
- 次の item があればそこへ移動する
- Break も対象に含む
- running 中ならフル時間の running
- paused 中ならフル時間の paused
- idle 中ならフル時間の idle

### Previous Item
- 1つ前の item に移動する
- Break も対象に含む
- 挙動は Next と同様に移動先のフル時間基準

## 5. 表示

Timer 画面では次を表示する。

- 現在 item 番号
- 全 item 数
- current item label
- 残り時間
- status
- Break バナー
- current blinds（Level 時）
- next item text

## 6. 重要な仕様

Break は Level の補助概念ではなく、**通常の item** として扱う。  
そのため自動遷移、手動遷移、next 表示すべての対象になる。
