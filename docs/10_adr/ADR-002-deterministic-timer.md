# ADR-002: Timer を deterministic にする

## Status
Accepted

## Context
interval 減算ベースのタイマーは、タブ非アクティブや復帰時にずれやすい。  
またテストもしにくい。

## Decision
TimerUsecase は `nowEpochMs` を引数に受け取り、現在時刻との差分から状態を再評価する。  
Usecase 内で `Date.now()` は使わない。

## Consequences
### 良い点
- テストしやすい
- 長時間停止後の整合を取りやすい
- 時刻同期の拡張に強い

### 悪い点
- UI 側が current time を渡す必要がある
- 実装理解に少しコストがかかる
