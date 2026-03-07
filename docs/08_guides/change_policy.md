# Change Policy

## 1. 仕様変更時の優先順位

変更要求が来たときは、次の順で考える。

1. これはアプリ仕様の変更か
2. これはデータ設計の変更か
3. これはアーキテクチャや責務の変更か
4. これは UI 表示だけの変更か

仕様 / データ / アーキテクチャ / UI を混ぜて変更しない。

---

## 2. よくある変更の入れ方

### item 種別を追加したい
- `02_domain/items.md`
- `04_usecases/*`
- `05_ui/snapshots.md`
- 必要なら ADR

### Timer の操作を増やしたい
- `01_product_spec/*`
- `04_usecases/timer_usecases.md`
- `07_engine/timer_engine.md`

### 保存方法を変えたい
- `06_persistence/*`
- `03_architecture/*`

### 画面を増やしたい
- `01_product_spec/*`
- `05_ui/*`

---

## 3. 変更時の注意

- Break を例外処理に戻さない
- structure の正規形を増やさない
- UI で業務ロジックを再発明しない
- 一時しのぎの命名を残さない
- 仕様変更に合わせて docs も更新する

---

## 4. docs 更新ルール

コード変更と同時に、最低でも以下のどれかを更新する。

- 仕様が変わった → `01_product_spec`
- 型が変わった → `02_domain`
- 責務が変わった → `03_architecture`
- 振る舞いが変わった → `04_usecases`, `07_engine`
- 保存が変わった → `06_persistence`
