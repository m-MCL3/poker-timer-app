# Spec（確定仕様）
Poker Timer App

---

# 0. 変更履歴
- 初版作成（タイマー仕様・ブラインド構造確定）
- 2026-03-02 永続化仕様（localStorage / JSON / Session復元）を確定

---

# 1. 用語定義

- Level: ブラインドの1段階（blind または break）
- Structure: Level配列（ブラインド構成）
- Session: 実行中の状態（タイマー＋現在Level等）

---

# 2. 画面構成

- Timer
- Editor
- Settings（詳細未確定）

---

# 3. タイマー仕様

## 3.1 状態

- idle（未開始）
- running（実行中）
- paused（一時停止）
- finished（最終レベル終了）

## 3.2 レベル遷移

- 0秒到達時は自動で次レベルへ移行する（最終レベルを除く）
- 最終レベル終了時は停止する（ループしない）
- レベル移行時は即座に新レベル時間を表示する
- アニメーション演出は行わない

## 3.3 手動操作

- 手動で次レベルへ進める
- 手動で前レベルへ戻れる
- 手動移動時は常にそのレベルのフル時間で開始する

## 3.4 アラート

- 残り5秒から1秒まで毎秒「カウントダウン音」を鳴らす
- 0秒到達時に「レベル移行音」を鳴らす
- カウントダウン音とレベル移行音は別音を使用する

## 3.5 一時停止と再開

- Pause中は時間を停止する
- 再開時は残り時間から継続する
- カウントダウン演出はリセットしない
- 実時間（epoch ms）基準で整合を取る

---

# 4. ブラインド構造（Level定義）

## 4.1 Structure

- Structureは全レベル共通の基本時間 `defaultDurationSeconds` を持つ
- データは `schemaVersion` を持つ

## 4.2 Level種別

Levelは以下の2種類とする：

- `blind`
- `break`

- breakも通常レベルと同様にカウントダウンする
- breakが0秒に到達した場合、自動で次のレベルへ移行する
- breakの時間も `defaultDurationSeconds` を適用し、必要に応じて個別上書きできる

## 4.3 表示ラベル（自動生成）

- 表示用の番号は `blind` のみを1から順に数えて自動生成する
- `break` は番号に含めない（表示名は "Break" とする）
- 例：`... 5` と `6` の間に break を挿入した場合、表示は `... 5 Break 6 ...` となる

## 4.4 Blindレベルのフィールド

- ゲーム種別：FL / NL / PL / STUD
- フィールドは共通とする：

  - sb
  - bb
  - ante

- STUDのUI表示では
  - sb → Bring-in
  - bb → Completion
  として表示する（内部値はsb/bbのまま保持）

- STUDでも ante は入力する

## 4.5 Duration

- 内部は秒で保持する
- UI入力は分を基本とし、内部へ変換して保持する
- 特殊用途のみ、Levelごとに `durationSecondsOverride` を持てる
- 未指定の場合は `defaultDurationSeconds` を適用する

## 4.6 バリデーション

- Structureは空配列禁止
- durationは最小1分以上
- sb / bb / ante は0以上の整数
- bb >= sb
- sb=0を許可する

---

# 5. 永続化（確定）

本フェーズでは **「ローカル永続化（端末内）」のみ** を確定する。  
クラウド同期（Supabase等）は将来の Adapter 差し替えで対応し、本仕様には含めない。

## 5.1 永続化対象

永続化は以下の3種に分離して行う（責務分離）：

1. **Structure（ブラインド構成）**
2. **Settings（音量などの設定）**
3. **Session（実行中の状態）**

> 重要：Structure と Session は別物。  
> Structure を編集しても、実行中 Session を勝手に変更しない。

## 5.2 保存先

- 既定：**localStorage**
- Key は namespace 付きで衝突を避ける  
  例：`poker-timer-app/v1/<kind>`

## 5.3 保存フォーマット（JSON / versioned）

### 5.3.1 StructureDocument

単一の「現在選択中の構成（active）」のみを保存対象とする。

```json
{
  "schemaVersion": 1,
  "structureId": "uuid",
  "defaultDurationSeconds": 900,
  "levels": [
    {
      "levelId": "uuid",
      "type": "blind",
      "durationSecondsOverride": 1200,
      "blind": { "gameType": "NL", "sb": 100, "bb": 200, "ante": 200 }
    },
    {
      "levelId": "uuid",
      "type": "break",
      "durationSecondsOverride": 300
    }
  ],
  "updatedAtEpochMs": 1710000000000
}
```

- `structureId` / `levelId` は **表示ラベルとは別** の安定ID（uuid推奨）
- 表示用ラベル（Blindの連番、Break表記）は **保存しない**（毎回生成）
- `durationSecondsOverride` が無い場合は `defaultDurationSeconds` を適用

### 5.3.2 SettingsDocument（最小）

```json
{
  "schemaVersion": 1,
  "sound": { "enabled": true, "volume": 0.8 },
  "updatedAtEpochMs": 1710000000000
}
```

※ Settings の項目追加は後方互換を守って拡張する（未定項目は追加しない）

### 5.3.3 SessionDocument（セッション復元用）

```json
{
  "schemaVersion": 1,
  "sessionId": "uuid",
  "structureId": "uuid",
  "timerState": "idle | running | paused | finished",
  "currentLevelIndex": 0,
  "levelStartedAtEpochMs": 1710000000000,
  "pausedAtEpochMs": null,
  "accumulatedPausedMs": 0,
  "updatedAtEpochMs": 1710000000000
}
```

- **実時間基準（epoch ms）** で整合を取るため、開始時刻・停止時刻・累積停止時間を保存する
- `timerState=idle` の場合、SessionDocument は保存しない（削除する）

## 5.4 保存タイミング

### Structure / Settings
- 変更確定のたびに保存（Usecase 経由）
- UI が連打しても破綻しないよう、保存は **最後の状態が勝つ（last write wins）** でよい

### Session
- 以下のイベントで保存する（Usecase 経由）
  - start / pause / resume / next / prev / finish
  - tick によって **レベルが変わった** とき
- 毎tickでの保存は行わない（ストレージ負荷を避ける）

## 5.5 起動時の復元（hydration）

1. SettingsDocument を読み込む（存在すれば適用）
2. StructureDocument を読み込む（存在しなければ「初期Structure」を生成して保持）
3. SessionDocument を読み込む（存在すれば復元）

### 復元時の整合（reconcile）
- 復元直後に `reconcile(nowEpochMs)` を **1回だけ** 実行して整合を取る  
  - その結果、0秒到達・自動次レベル移行・finished まで到達することがある
- **復元処理中はサウンドを鳴らさない**（0秒到達などで音が暴発しないため）

## 5.6 手動エクスポート / インポート

- **対象：StructureDocument のみ**
- 形式：上記 JSON（schemaVersion 付き）
- SessionDocument はエクスポート対象外（端末復元のための一時データ扱い）

---

# 6. Editor仕様（未確定）

（次フェーズで確定予定）