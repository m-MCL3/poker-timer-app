# ADR-004 Preset 保存対象は Structure とする

## 決定
Preset が保存するのは `TimerStructure` であり、Runtime ではない。

## 理由
- Preset の目的は構造の再利用
- 実行途中状態の復元とは別機能
- Snapshot は再生成可能

## 結果
preset repository は structure 保存に集中する。
