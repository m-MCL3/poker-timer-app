# アーキテクチャ

## 1. 採用方針

本プロジェクトは Clean Architecture の考え方をベースにする。  
重要なのは「内側のルールが外側を知らない」ことであり、過剰な抽象化ではない。

## 2. レイヤ構成

- UI
- Usecase
- Domain
- Infrastructure

## 3. 各レイヤの責務

### UI
- 画面表示
- 入力取得
- 画面遷移
- confirm / prompt / alert

### Usecase
- 状態遷移
- Snapshot 生成
- 編集操作適用
- バリデーションや名前正規化

### Domain
- TimerStructure
- TimerItem
- BlindGroup
- Preset summary
- EditOperation
- 純粋なモデル

### Infrastructure
- LocalStorage / IndexedDB
- serialize / deserialize
- preset index 保存
- clock 実装
- runtime store 実装

## 4. この分離が重要な理由

Timer のような状態機械では、UI がロジックを持つと破綻しやすい。  
Break 表示や next item 文言のような判断を UI に散らすと、画面ごとに解釈がずれる。  
Usecase に寄せることで、挙動が一箇所に集まる。

## 5. 現在の重要境界

- structure と表示派生情報の境界
- runtime と snapshot の境界
- nowEpochMs と状態更新の境界

この 3 つがアプリの設計を安定させる。
