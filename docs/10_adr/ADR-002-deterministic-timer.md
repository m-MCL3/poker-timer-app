# ADR-002: Timer を deterministic にする

## Status
Accepted

## Context
interval 減算ベースのタイマーは、タブ非アクティブ時や復帰時にずれやすい。
またテストもしにくい。

## Decision
TimerUsecase は `nowEpochMs` を引数に取り、現在時刻との差分で状態を再計算する。
Usecase 内で `Date.now()` は使わない。

## Consequences

### 良い点
- テストしやすい
- 長時間停止後でも整合が取りやすい
- 将来同期処理に寄せやすい

### 悪い点
- UI が current time を渡す必要がある
- 初見では少し理解コストがある
