# ドキュメント構造

## 1. なぜ docs を階層化するのか

このプロジェクトでは、コードだけでなく **ドキュメントにもアーキテクチャを持たせる**。

仕様、データ設計、アーキテクチャ、開発ルール、将来構想が混在すると、何をどこに書くべきか分からなくなり、変更時に破綻しやすい。  
そのため、本 docs は責務ごとに分割する。

## 2. フォルダごとの責務

- `00_overview`: プロジェクト全体像と docs の読み方
- `01_application_spec`: ユーザー視点のアプリ仕様
- `02_domain_design`: データ構造と不変条件
- `03_architecture`: レイヤ責務と依存規則
- `04_usecases`: 振る舞いと公開 API
- `05_ui_design`: 画面と Snapshot 契約
- `06_persistence`: 保存対象と保存形式
- `07_timer_engine`: 時刻整合、tick、次 Break 算出
- `08_development_guides`: 実装時のルール
- `09_roadmap`: 未確定事項と将来構想
- `10_adr`: 設計判断の記録
- `11_diagrams`: 図の索引と配置先

## 3. どのドキュメントを見るべきか

### アプリで何ができるか知りたい
- `README.md`
- `docs/01_application_spec/*`

### データ構造を知りたい
- `docs/02_domain_design/*`

### レイヤ責務を知りたい
- `docs/03_architecture/*`

### 振る舞いを知りたい
- `docs/04_usecases/*`
- `docs/07_timer_engine/*`

### UI と表示モデルを知りたい
- `docs/05_ui_design/*`

### 保存方式を知りたい
- `docs/06_persistence/*`

### 実装時のルールを知りたい
- `docs/08_development_guides/*`

### なぜこの設計なのか知りたい
- `docs/10_adr/*`

## 4. 更新ルール

- 機能が増減したら `01_application_spec`
- 型やデータ構造が変わったら `02_domain_design`
- 責務分離が変わったら `03_architecture`
- 挙動や公開 API が変わったら `04_usecases`
- タイマー進行仕様が変わったら `07_timer_engine`
- 保存方式が変わったら `06_persistence`
- 設計判断を残すなら `10_adr`

## 5. この docs が目指す状態

理想は、**コードを読まなくても全体像が把握でき、変更時にどこを直せばよいか分かる**こと。  
本 docs は、そのための設計図であり、単なる補足メモではない。
