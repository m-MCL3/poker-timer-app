# Change Policy

## 1. 変更要求が来たら最初に考えること

1. これはアプリ仕様の変更か
2. これはデータ設計の変更か
3. これはアーキテクチャの変更か
4. これは UI 表示だけの変更か

この切り分けをしてから変更する。

## 2. 変更の入れ方

### item 種別を追加したい
- `02_domain_design`
- `04_usecases`
- `05_ui_design`
- 必要なら ADR

### Timer 操作を増やしたい
- `01_application_spec`
- `04_usecases/timer_usecases.md`
- `07_timer_engine/timer_engine.md`

### 保存方法を変えたい
- `06_persistence`
- `03_architecture`

### 新画面を増やしたい
- `01_application_spec`
- `05_ui_design`

## 3. 守るべきこと

- Break を例外扱いに戻さない
- structure の正規形を増やさない
- UI にロジックを散らさない
- 仕様変更時は docs も更新する

## 4. docs 更新ルール

- 仕様が変わった → 01_application_spec
- 型が変わった → 02_domain_design
- 責務が変わった → 03_architecture
- 振る舞いが変わった → 04_usecases / 07_timer_engine
- 保存が変わった → 06_persistence
