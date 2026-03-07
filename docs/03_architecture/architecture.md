# Architecture

## 1. 採用方針

本プロジェクトは Clean Architecture の考え方をベースにしている。  
ただし過剰に抽象化することは避け、現時点で必要な責務分離を明確にする。

---

## 2. レイヤ構成

```text
UI
↓
Usecase
↓
Domain
↓
Infrastructure
```

実際には Infrastructure は Domain に依存せず、Usecase と Domain の外側に位置する。  
依存方向として重要なのは、**内側のルールが外側を知らない**こと。

---

## 3. 各レイヤの責務

### Domain
- トーナメント構造の型
- item 概念
- preset 要約型
- edit operation 型
- 純粋なモデル

### Usecase
- 状態遷移
- 編集操作適用
- snapshot 生成
- preset 名の正規化 / バリデーション
- Timer / Editor / Preset の振る舞い

### Infrastructure
- LocalStorage との入出力
- serialize / deserialize
- preset index 保存

### UI
- snapshot 描画
- ユーザー入力収集
- 画面遷移
- confirm / prompt / alert 呼び出し

---

## 4. なぜこの分離が必要か

### UI がロジックを持つと起きる問題
- Break 表示や Next/Prev 挙動が画面ごとにずれる
- テストしにくい
- 実装者ごとに解釈が分かれる

### Usecase に寄せる利点
- 挙動が一箇所に集まる
- テスト対象が明確になる
- UI は描画に集中できる

---

## 5. 現在のアプリにおける重要境界

このアプリの最重要境界は次の2つ。

1. `TournamentStructure` と Snapshot の境界
2. 時刻入力 `nowEpochMs` と状態更新の境界

これにより、
- 構造の真実
- 時間進行の真実
- 表示の真実

を切り分けている。
