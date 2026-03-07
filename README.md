# Poker Timer App

ポーカーサークル向けのトーナメントタイマーアプリ。

本リポジトリは、単なる「残り時間を表示するタイマー」ではなく、**トーナメント構造を編集・保存・再利用できる実用的な運営ツール**として設計されている。  
特に以下を重視している。

- **トーナメント構造を明示的にモデル化すること**
- **Break を Level の例外ではなく、通常の item として扱うこと**
- **実時間（epoch ms）基準の deterministic timer にすること**
- **UI を状態表示に専念させ、ロジックを Usecase に閉じ込めること**
- **今後の拡張に耐える構造を先に整えること**

---

## このアプリでできること

### 1. トーナメントタイマーの実行
- 現在 item の残り時間を表示する
- タップで開始 / 一時停止 / 再開する
- 0秒到達で自動的に次 item へ進む
- 最終 item 到達後は `finished` になる
- 手動で前 / 次 item に移動できる
- Break も通常 item として順送り・逆送りできる

### 2. トーナメント構造の編集
- Level を挿入できる
- Break を挿入できる
- item を削除できる
- item 種別を Level / Break で切り替えられる
- 各 item の duration を変更できる
- Level item の blinds を編集できる

### 3. プリセット管理
- 現在の構造をプリセット保存できる
- 保存済みプリセットを読み込める
- プリセット名を変更できる
- プリセットを削除できる

### 4. 将来拡張を見据えた構造化
- deterministic timer による時間整合
- item 基準モデルによる将来 item 種別追加への耐性
- Preset 永続化の分離
- UI / Usecase / Domain / Infrastructure の責務分離

---

## 設計の要点

### TournamentStructure を唯一の真実にする
タイマー構造の正規表現は `TournamentStructure` だけとする。  
UI 表示や Editor の draft 都合のために別構造を乱立させず、必要な派生情報は Snapshot で解決する。

### Level と Break を同列 item とする
Break を「Level の隙間にある特殊ケース」として扱うと、手動 Next/Prev や表示で破綻しやすい。  
そのため本アプリでは `LevelItem | BreakItem` の配列として構造を持つ。

### deterministic timer
時間計算は `Date.now()` に依存するのではなく、`nowEpochMs` を引数で受け取る。  
これにより次の利点がある。

- テストしやすい
- 長時間タブ非アクティブ後も整合が取りやすい
- 将来的な同期処理やサーバ時刻基準にも寄せやすい

### UI は Snapshot を描くだけ
UI で「今 Break だからこう」「次が Level だからこう」というロジックを持ち込まない。  
Usecase で `TimerSnapshot` / `EditorSnapshot` を作り、UI はそれを描画する。

---

## ドキュメント構成

- `docs/00_overview`  
  プロジェクト全体の目的、対象、前提、考え方
- `docs/01_product_spec`  
  ユーザーから見たアプリ仕様
- `docs/02_domain`  
  データ設計、用語、モデル
- `docs/03_architecture`  
  レイヤ構造、依存方向、設計原則
- `docs/04_usecases`  
  Timer / Editor / Preset の振る舞い
- `docs/05_ui`  
  画面設計と UI が扱う表示モデル
- `docs/06_persistence`  
  LocalStorage と preset 保存形式
- `docs/07_engine`  
  deterministic timer の時間同期設計
- `docs/08_guides`  
  実装ガイド、コーディング方針、変更時の注意
- `docs/09_roadmap`  
  未確定の将来構想
- `docs/10_adr`  
  重要設計判断の記録

---

## このドキュメントの読み方

### アプリで何ができるか知りたい
- `docs/01_product_spec/application_spec.md`
- `docs/05_ui/screens.md`

### データ設計を知りたい
- `docs/02_domain/tournament_structure.md`
- `docs/02_domain/items.md`
- `docs/02_domain/states_and_snapshots.md`

### アーキテクチャと責務を知りたい
- `docs/03_architecture/architecture.md`
- `docs/03_architecture/dependency_rules.md`

### 実装時の指針を知りたい
- `docs/08_guides/coding_guidelines.md`
- `docs/08_guides/change_policy.md`

### 設計判断の理由を知りたい
- `docs/10_adr/*.md`

---

## 現時点の前提

- 保存先は LocalStorage
- 設定画面は未確定
- 通知音や詳細なアラート仕様は今後詰める余地がある
- モック段階のため保存 schema は現時点を `v1` とする
- 旧構造互換は持たない
