# Application Specification

## 1. アプリ概要

Poker Timer App は、ポーカートーナメントの進行を支援する Web アプリである。
トーナメント構造の編集、プリセット保存、タイマー実行を一連の流れとして扱う。

## 2. 主要機能

### 2.1 Timer
Timer 画面は、現在実行中のトーナメント構造を表示し、進行を操作する画面である。

できること
- Start / Pause / Resume
- Reset
- Next Item
- Previous Item
- 現在 item 表示
- 次 item 表示
- 残り時間表示
- Break 表示
- Level 時の blinds 表示

### 2.2 Editor
Editor 画面は、TournamentStructure を編集する画面である。

できること
- Level 追加
- Break 追加
- 項目削除
- Level / Break 切り替え
- duration 編集
- blinds 編集

### 2.3 Presets
プリセットは TournamentStructure の保存・再利用機能である。

できること
- Save Preset
- Load Preset
- Rename Preset
- Delete Preset

## 3. 画面一覧

- Timer
- Editor
- Settings（詳細未確定）

## 4. 基本的な利用フロー

1. Editor でトーナメント構造を作る
2. 必要なら Preset として保存する
3. Timer でトーナメントを実行する
4. 同じ構造を使うときは Preset から読み込む

## 5. 対象外 / 未確定

- 音通知の詳細
- サーバ同期
- マルチユーザ
- 権限管理
- 履歴管理

これらは現時点で確定仕様ではない。
