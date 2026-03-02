# Architecture Design Document
# Poker Timer App

---

# 1. 設計思想（Design Philosophy）

本アプリは「仕様ベース設計」を採用する。

UIや保存方式ではなく、
**タイマー・ブラインド構成・セッション進行という仕様の核（ドメイン）を中心に設計する。**

---

## 設計原則

1. ドメインは純粋であること（React・Storage・Dateに依存しない）
2. 状態変更は Usecase 経由のみで行う
3. 永続化や外部I/Oは Ports/Adapters で分離する
4. アプリケーションの「真実の状態」は一箇所に固定する
5. 依存方向は常に内側（Domain）へ向かう

---

# 2. レイヤー構成

```

UI → State → Usecases → Domain
↓
Ports
↓
Adapters

```

---

# 3. 各レイヤーの責務

## 3.1 Domain（仕様の核）

責務：
- タイマーの状態と遷移ロジック
- ブラインド構造のモデルと検証
- セッション進行のルール
- 純粋なビジネスロジック

制約：
- Reactをimportしない
- localStorageを触らない
- Date.now()を直接使わない（nowは引数で受け取る）

Domainは最も安定した層であり、
将来のUI変更・保存方式変更の影響を受けない。

---

## 3.2 Usecases（仕様の操作）

責務：
- ユーザー操作の実行
- 状態遷移の調整
- Repository呼び出し
- 保存タイミング制御
- エラーハンドリング

例：
- toggleTimer
- tickTimer
- loadStructure
- saveStructure
- updateLevel

Usecaseは「動詞」のみを持つ。

---

## 3.3 Ports（外部との契約）

責務：
- Repository interface定義
- Clock interface定義
- Sound interface定義

DomainはPortsを通じて外界と接触する。

---

## 3.4 Adapters（外部実装）

責務：
- localStorage実装
- systemClock実装
- Web Audio実装

差し替え可能であることが前提。

---

## 3.5 State（唯一の真実）

責務：
- Domain state保持
- UI state保持
- Usecase呼び出し窓口

ルール：
- 真実の状態は1箇所のみ
- Contextやhookで二重管理しない

---

## 3.6 UI

責務：
- 表示
- 入力受付
- コマンド発行

制約：
- Repositoryを直接呼ばない
- Domainロジックを書かない

---

# 4. 依存ルール（Dependency Rule）

- Domain ← 依存される側
- Usecase → Domainのみ依存可
- Adapter → Ports実装のみ
- UI → Stateのみ参照
- UI → Adapter直接依存は禁止

---

# 5. タイマー設計方針（重要）

Webタイマーは setInterval 依存ではズレる。

本設計では：

- 実時間（epoch ms）基準で計算
- reconcile(now) で整合を取る
- 非アクティブ復帰に対応

これにより、精度と安定性を担保する。

---

# 6. 状態管理方針

状態は以下に分類する：

1. Domain State（timer / structure / session）
2. UI State（menu open, filter等）
3. Infra State（hydrated, saving等）

二重管理は禁止。

---

# 7. 未確定仕様の扱い

未確定仕様は以下のプロセスで決定する：

1. 選択肢提示
2. 承認
3. docs/spec.mdへ記録
4. 実装

仕様未確定のまま実装しない。

---

# 8. 将来拡張性

本設計は以下に対応可能：

- localStorage → Supabase差し替え
- 複数構成管理
- マルチサークル対応
- 同期機能追加
- 通知機能追加

変更はAdapter層またはUsecase層に限定される。

---

# 9. 実装順序

1. Domain
2. Ports
3. Adapters
4. Usecases
5. State
6. UI

UI先行実装は禁止。

---

# 10. 結論

本アーキテクチャは

- 責任分離を徹底し
- 変更に強く
- 拡張に耐え
- テスト可能である

ことを目的とする。

以上。
