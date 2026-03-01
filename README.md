# ポーカートーナメントタイマー

## アプリ仕様書（確定版 v1.0）

---

# 1. 目的

本アプリは、ポーカートーナメントにおける

* レベル管理
* 残り時間表示
* ブラインド情報の統合表示

を行うWebアプリである。

将来的にリアルタイム共有および権限管理機能を実装する。

---

# 2. 動作環境

* Webブラウザ（PC / タブレット / スマートフォン）
* SPA（React + Vite）
* 将来的に Supabase によるクラウド連携

---

# 3. タイマー仕様

## 3.1 基本動作

* レベル単位でカウントダウン
* レベル時間は秒単位で管理
* 残り時間が0になると次レベルへ自動遷移
* レベル変更時、残り時間はそのレベルの設定時間へリセット

---

## 3.2 操作仕様

### 基本操作

* 画面タップ（クリック）で Start / Stop トグル

### メニュー操作（右上アイコン）

将来的に以下操作を実装予定：

* Reset
* Next Level
* Prev Level
* ブラインド編集
* 保存 / 読込
* 各種設定

※現段階では仮メニュー表示のみ

---

# 4. ブラインド仕様

## 4.1 表示種別（常時3種表示）

1. FL（Fixed Limit）
2. STUD
3. NL/PL（No Limit / Pot Limit）

---

## 4.2 表示構造（共通ルール）

各種別は共通構造を持つ。

### 構造

* 上段：小ラベル3項目
* 下段：大表示3項目
* 3カラム固定構造
* 各値は独立描画（文字列結合禁止）

### 表示形式

```

A / B ( C )

````

* A：第1項目
* B：第2項目
* C：第3項目

---

## 4.3 各種別定義（確定）

---

### FL（Fixed Limit）

| 項目   | 内容                  |
| ---- | ------------------- |
| ラベル  | SB / BB / Ante      |
| 表示形式 | SB値 / BB値 ( Ante値 ) |
| 備考   | Anteが0の場合は "-" 表示   |

---

### STUD

| 項目   | 内容                              |
| ---- | ------------------------------- |
| ラベル  | Bring-in / Complete / Ante      |
| 表示形式 | Bring-in値 / Complete値 ( Ante値 ) |

---

### NL/PL

| 項目   | 内容                        |
| ---- | ------------------------- |
| ラベル  | SB / BB / Ante            |
| 表示形式 | SB値 / BB値 ( NLAnte値 / - ) |
| 備考   | PLはAnte無しのため "-" 表示       |

---

# 5. レベル定義仕様

## 5.1 レベルデータ構造

```ts
{
  durationSec: number,
  blinds: {
    fl: { sb: number, bb: number, ante: number },
    stud: { bringIn: number, complete: number, ante: number },
    nlpl: { sb: number, bb: number, nlAnte: number }
  }
}
````

---

## 5.2 Next Level表示

* 次レベルのブラインド情報を表示
* 3種（FL / STUD / NL/PL）を表示
* 現在は文字列表示

---

# 6. レイアウト方針

* 横幅は最大約760pxに制限
* 中央寄せ
* ダークテーマ
* スマホ対応（レスポンシブ）
* 数値フォントはviewportに応じて可変
* 表示ズレは構造設計で防止

---

# 7. 権限設計（将来仕様）

## 7.1 ユーザ種別

| 種別    | 権限   |
| ----- | ---- |
| 管理者   | 操作可能 |
| 一般ユーザ | 閲覧のみ |

---

## 7.2 マルチユーザ対応（予定）

* Supabaseによるリアルタイム同期
* running中はサーバ基準時刻との差分で残り時間算出
* 複数トーナメント同時管理対応

---

# 8. 将来拡張仕様

## 8.1 ディーラーモード

* テーブル単位で gameType 管理
* ゲームカウント管理（例：6ハンド毎に変更）
* ゲーム別ブラインド表示
* タイマー本体とは独立状態

---

## 8.2 ブラインド管理機能

* ブラインド構造の複数保存
* セーブ / ロード
* JSON外部定義
* 管理画面による編集

---

# 9. アーキテクチャ（ディレクトリ / ファイル構造）

本プロジェクトは React + Vite + TypeScript を前提に、拡張性を考慮した構造を採用する。

* pages: 画面（ルーティング単位）
* widgets: 画面を構成する大きめUIブロック
* features: “ユーザー行動”単位（Start/Stop、遷移、import/export等）
* entities: アプリ中心データ（Tournament/Level/Blinds等）
* shared: 共通UI・共通ライブラリ（time/storage/hooks等）
* processes: アプリ横断の複合フロー（同期、ディーラーモード等）
* infrastructure: 外部I/O（Supabase、モック）

```txt
poker-tournament-timer/
├─ README.md                       # 本ドキュメント（仕様・方針・構造）
├─ package.json                    # 依存関係 / scripts
├─ vite.config.ts                  # Vite設定（aliasやPWA設定もここ）
├─ tsconfig.json                   # TypeScript設定（アプリ用）
├─ tsconfig.node.json              # Node側TS設定（Vite config等）
├─ eslint.config.js                # ESLint設定
├─ postcss.config.js               # PostCSS設定（Tailwind用）
├─ tailwind.config.ts              # Tailwind設定（テーマ拡張など）
├─ index.html                      # エントリHTML
├─ public/                         # 静的ファイル
│  ├─ icons/                       # PWA用アイコン
│  │  ├─ icon-192.png              # PWAアイコン（192）
│  │  └─ icon-512.png              # PWAアイコン（512）
│  ├─ manifest.webmanifest         # PWA manifest
│  └─ favicon.svg                  # ファビコン
├─ docs/                           # 仕様・設計ドキュメント
│  ├─ spec.md                      # READMEより詳細な仕様の置き場
│  ├─ decisions/                   # ADR（設計判断の記録）
│  │  ├─ adr-0001-architecture.md  # アーキ選定理由
│  │  └─ adr-0002-state-management.md # 状態管理の方針
│  └─ api/
│     └─ supabase-schema.md        # 将来のDB/権限/テーブル設計
├─ scripts/                        # 補助スクリプト（任意）
│  ├─ gen-version.mjs              # バージョン生成（任意）
│  └─ check-types.mjs              # 型チェック補助（任意）
├─ supabase/                       # Supabase関連（将来拡張/ローカル開発含む）
│  ├─ migrations/                  # DBマイグレーション
│  ├─ seed.sql                     # 初期データ
│  └─ functions/                   # Edge Functions（必要になったら）
├─ tests/                          # テスト
│  ├─ e2e/                         # E2Eテスト（Playwright等）
│  └─ fixtures/                    # テスト用データ
└─ src/
   ├─ main.tsx                     # React起動エントリ
   ├─ app/                         # アプリ基盤層（Provider/Router/Config）
   │  ├─ App.tsx                   # ルートコンポーネント（レイアウト統合）
   │  ├─ providers/                # Router/Theme/Auth/Query等のProvider群
   │  │  ├─ router-provider.tsx    # Router供給
   │  │  ├─ theme-provider.tsx     # テーマ供給（ダーク等）
   │  │  ├─ auth-provider.tsx      # 認証状態供給（将来）
   │  │  └─ query-provider.tsx     # データ取得基盤（将来）
   │  ├─ router/                   # ルーティング定義
   │  │  ├─ routes.tsx             # ルート一覧
   │  │  └─ guards.tsx             # 権限/ログインガード（将来）
   │  ├─ styles/
   │  │  └─ globals.css            # グローバルCSS（Tailwind base等）
   │  ├─ config/
   │  │  ├─ env.ts                 # env読み取り/型付け
   │  │  ├─ feature-flags.ts       # 機能フラグ
   │  │  └─ constants.ts           # 定数
   │  └─ error/
   │     ├─ error-boundary.tsx     # UI例外の捕捉
   │     └─ error-page.tsx         # エラー表示ページ
   │
   ├─ pages/                       # 画面（ルーティング単位）
   │  ├─ timer/
   │  │  └─ timer-page.tsx         # 主画面（タイマー）
   │  ├─ blind-editor/
   │  │  └─ blind-editor-page.tsx  # ブラインド編集画面（将来）
   │  ├─ tournaments/
   │  │  ├─ tournaments-page.tsx   # トーナメント一覧（将来）
   │  │  └─ tournament-detail-page.tsx # トーナメント詳細（将来）
   │  ├─ settings/
   │  │  └─ settings-page.tsx      # 設定画面（将来）
   │  └─ auth/
   │     ├─ sign-in-page.tsx       # ログイン（将来）
   │     └─ callback-page.tsx      # OAuthコールバック（将来）
   │
   ├─ widgets/                     # 画面を構成する大きめUIブロック
   │  ├─ timer-board/
   │  │  ├─ ui/
   │  │  │  ├─ timer-board.tsx     # タイマー表示UI
   │  │  │  └─ timer-board.skeleton.tsx # ローディング骨組み（任意）
   │  │  └─ index.ts               # export集約
   │  ├─ blinds-panel/
   │  │  ├─ ui/
   │  │  │  ├─ blinds-panel.tsx    # FL/STUD/NLPL表示ブロック
   │  │  │  ├─ blinds-row.tsx      # 種別ごとの1行
   │  │  │  └─ blinds-item.tsx     # 値のUI部品（※値は結合禁止・独立描画）
   │  │  └─ index.ts
   │  ├─ next-level-panel/
   │  │  ├─ ui/
   │  │  │  └─ next-level-panel.tsx # Next Level表示
   │  │  └─ index.ts
   │  └─ top-menu/
   │     ├─ ui/
   │     │  ├─ top-menu-button.tsx  # 右上のメニューアイコン
   │     │  └─ top-menu-popover.tsx # アイコンから下に開くメニュー
   │     └─ index.ts
   │
   ├─ features/                    # ユーザー操作（行動）単位のロジック
   │  ├─ timer-control/
   │  │  ├─ model/
   │  │  │  ├─ use-timer-control.ts     # Start/StopのユースケースHook
   │  │  │  └─ timer-control.slice.ts   # 状態（running/paused等）
   │  │  ├─ ui/
   │  │  │  └─ tap-to-toggle-layer.tsx  # 画面タップでStart/Stopする操作レイヤ
   │  │  └─ index.ts
   │  ├─ level-transition/
   │  │  ├─ model/
   │  │  │  ├─ level-transition.service.ts # レベル遷移ロジック
   │  │  │  └─ use-auto-next-level.ts      # 自動遷移（必要なら）
   │  │  └─ index.ts
   │  ├─ blind-set-import-export/
   │  │  ├─ model/
   │  │  │  ├─ export-blinds.ts        # エクスポート（JSON等）
   │  │  │  ├─ import-blinds.ts        # インポート
   │  │  │  └─ validate-blinds.ts      # 形式検証
   │  │  ├─ ui/
   │  │  │  ├─ export-button.tsx       # export UI
   │  │  │  └─ import-dialog.tsx       # import UI
   │  │  └─ index.ts
   │  ├─ blind-edit/
   │  │  ├─ model/
   │  │  │  ├─ blind-edit.slice.ts     # 編集状態（dirty等）
   │  │  │  └─ blind-edit.validators.ts # 入力検証
   │  │  ├─ ui/
   │  │  │  ├─ blind-form.tsx          # 編集フォーム
   │  │  │  └─ level-list.tsx          # レベル一覧UI
   │  │  └─ index.ts
   │  ├─ auth/
   │  │  ├─ model/
   │  │  │  ├─ auth.slice.ts           # 認証状態
   │  │  │  └─ use-session.ts          # セッションHook
   │  │  ├─ ui/
   │  │  │  └─ sign-in-button.tsx      # ログインボタン
   │  │  └─ index.ts
   │  └─ permissions/
   │     ├─ model/
   │     │  ├─ permissions.ts          # 権限定義
   │     │  └─ can.ts                  # 権限判定
   │     └─ index.ts
   │
   ├─ entities/                     # アプリ中心データ（ドメインモデル）
   │  ├─ tournament/
   │  │  ├─ model/
   │  │  │  ├─ types.ts               # 型定義
   │  │  │  ├─ tournament.schema.ts   # 検証スキーマ
   │  │  │  └─ tournament.factory.ts  # 生成補助
   │  │  ├─ api/
   │  │  │  ├─ tournament.repo.ts     # 永続化interface
   │  │  │  └─ tournament.repo.mock.ts # モック
   │  │  └─ index.ts
   │  ├─ level/
   │  │  ├─ model/
   │  │  │  ├─ types.ts               # 型定義
   │  │  │  ├─ level.schema.ts        # 検証スキーマ
   │  │  │  └─ formatters.ts          # 表示用整形
   │  │  └─ index.ts
   │  ├─ blinds/
   │  │  ├─ model/
   │  │  │  ├─ types.ts               # fl/stud/nlpl（常時3種）
   │  │  │  ├─ blinds.schema.ts       # 検証スキーマ
   │  │  │  └─ display.ts             # A/B(C) 表示計算（文字列結合はしない前提）
   │  │  └─ index.ts
   │  └─ user/
   │     ├─ model/
   │     │  ├─ types.ts               # 型定義
   │     │  └─ roles.ts               # admin/viewer 等
   │     └─ index.ts
   │
   ├─ shared/                       # 汎用共通モジュール
   │  ├─ ui/                         # 共通UI部品
   │  │  ├─ button.tsx
   │  │  ├─ card.tsx
   │  │  ├─ popover.tsx
   │  │  ├─ typography.tsx
   │  │  └─ responsive.ts
   │  ├─ lib/                        # ユーティリティ
   │  │  ├─ time/
   │  │  │  ├─ clock.ts              # 時刻/残り時間の扱い（将来server-timeも）
   │  │  │  └─ duration.ts
   │  │  ├─ storage/
   │  │  │  ├─ local-storage.ts
   │  │  │  └─ versioned-storage.ts
   │  │  ├─ json/
   │  │  │  ├─ parse.ts
   │  │  │  └─ download.ts
   │  │  ├─ fp/
   │  │  │  ├─ result.ts
   │  │  │  └─ assert-never.ts
   │  │  └─ logger/
   │  │     └─ logger.ts
   │  ├─ api/
   │  │  ├─ http-client.ts           # APIクライアント（将来）
   │  │  └─ realtime/
   │  │     └─ channel.ts            # Realtime共通
   │  ├─ hooks/
   │  │  ├─ use-event.ts
   │  │  ├─ use-interval.ts
   │  │  └─ use-media-query.ts
   │  └─ types/
   │     ├─ brand.ts
   │     └─ env.d.ts
   │
   ├─ processes/                    # アプリ横断の複合フロー（将来拡張）
   │  ├─ realtime-sync/
   │  │  ├─ model/
   │  │  │  ├─ sync.controller.ts     # 同期制御
   │  │  │  ├─ sync.slice.ts          # 同期状態
   │  │  │  └─ drift-correction.ts    # サーバ基準の差分補正
   │  │  └─ index.ts
   │  ├─ dealer-mode/
   │  │  ├─ model/
   │  │  │  ├─ dealer-mode.slice.ts   # ディーラーモード状態
   │  │  │  └─ game-rotation.ts       # ゲーム回しロジック
   │  │  ├─ ui/
   │  │  │  └─ dealer-panel.tsx       # ディーラーパネルUI
   │  │  └─ index.ts
   │  └─ multi-tournament/
   │     ├─ model/
   │     │  ├─ active-tournament.slice.ts # アクティブ管理
   │     │  └─ routing.ts             # ルーティング補助
   │     └─ index.ts
   │
   └─ infrastructure/               # 外部I/O実装（差し替え可能にする）
      ├─ supabase/
      │  ├─ client.ts                # Supabaseクライアント初期化
      │  ├─ auth.ts                  # 認証ラッパ
      │  ├─ realtime.ts              # Realtime購読ラッパ
      │  └─ repos/
      │     ├─ tournament.repo.supabase.ts # Tournament永続化（Supabase）
      │     └─ blinds.repo.supabase.ts     # Blinds永続化（Supabase）
      ├─ mock/
      │  ├─ seed.ts                  # ローカル用初期データ
      │  └─ repos/
      │     ├─ tournament.repo.memory.ts # Tournament永続化（メモリ）
      │     └─ blinds.repo.memory.ts     # Blinds永続化（メモリ）
      └─ index.ts                    # 実装差し替えの集約（env/feature flag）
```

---
