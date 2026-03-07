# Document Architecture

## 1. なぜドキュメントを階層化するのか

このプロジェクトでは、コードだけでなく**ドキュメントにもアーキテクチャを持たせる**。
仕様、データ設計、アーキテクチャ、開発ルール、将来構想が混在すると、何をどこに書くべきか分からなくなり、変更時に破綻しやすい。

そのため、本ドキュメントは次の区分で管理する。

- 00_overview: 全体像
- 01_application_spec: ユーザー視点のアプリ仕様
- 02_domain_design: データ設計
- 03_architecture: レイヤ責務と依存規則
- 04_usecases: 振る舞いと状態遷移
- 05_ui_design: 画面設計と Snapshot
- 06_persistence: 保存設計
- 07_timer_engine: タイマーエンジン
- 08_development_guides: 実装指針
- 09_roadmap: 未確定の将来構想
- 10_adr: 設計判断記録
- 11_diagrams: 図による理解補助

## 2. どのドキュメントを見ればよいか

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

## 3. 更新ルール

- 機能が増減したら `01_application_spec`
- 型やデータ構造が変わったら `02_domain_design`
- 責務分離が変わったら `03_architecture`
- 状態遷移が変わったら `04_usecases`, `07_timer_engine`
- 保存方式が変わったら `06_persistence`
- 設計判断を追加したいなら `10_adr`

## 4. このドキュメントで目指す状態

理想は、**コードを読まなくても全体像が把握でき、変更時にどこを直せばよいか分かる**こと。
本 docs はそのための設計図であり、単なる補足メモではない。
