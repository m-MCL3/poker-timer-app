# Spec（確定仕様）
Poker Timer App（Web / PWA）

---

# 0. 変更履歴
- 初版作成：タイマー仕様・ブラインド構造確定
- 2026-03-02：永続化仕様を確定。Editorは別画面のためTODO化し、現フェーズで必要な「構成供給（既定Structure）」のみ確定。

---

# 1. 用語定義
- **Level**: ブラインドの1段階（`blind` または `break`）
- **Structure**: Level配列（ブラインド構成）
- **Session**: 実行中の状態（タイマー＋現在Level等）
- **Epoch ms**: `Date.now()` 等で得られるミリ秒（実時間基準の整合に使用）

---

# 2. アーキテクチャ方針（設計制約）
- Clean Architectureベースで **Domain / Usecase / Adapters / UI** を分離する
- **id と表示用ラベルは分離**（表示連番・"Break" 等は保存しない / UI側で生成）
- タイマー整合は **実時間（epoch ms）基準**
- **仕様未確定は実装しない**（未確定はTODOに留める）

---

# 3. 画面構成（現フェーズ）
- **Timer**（実装対象）
- **Editor**（別画面：TODO / 未実装）
- **Settings**（詳細未確定：TODO）

> 現フェーズでは、Editor未実装でもTimerが開始できるように「構成供給（既定Structure）」を確定する。

---

# 4. タイマー仕様

## 4.1 状態
- `idle`（未開始）
- `running`（実行中）
- `paused`（一時停止）
- `finished`（最終レベル終了）

## 4.2 レベル遷移（自動）
- 残り時間が **0秒に到達**したら **自動で次レベルへ移行**する（最終レベルを除く）
- **最終レベル**で 0秒に到達したら `finished` に遷移して停止する（ループしない）
- レベル移行時の表示は **即座に新レベル時間を表示**する
- レベル移行時に **アニメーション演出は行わない**

## 4.3 手動操作
- 手動で **次レベルへ進める**
- 手動で **前レベルへ戻れる**
- 手動移動時は **常にそのレベルのフル時間**で開始する（残り時間を引き継がない）

## 4.4 アラート（音）
- 残り **5秒〜1秒**で毎秒 **カウントダウン音**
- **0秒到達**時に **レベル移行音**（別音）
- 音の実装詳細（音源、ミュート、端末制約）は別途 TODO（ただし発火条件は本仕様で固定）

## 4.5 一時停止と再開（実時間基準）
- Pause中は時間を停止する
- 再開時は残り時間から継続する（延長しない）
- 実時間（epoch ms）基準で整合を取る（setIntervalの誤差吸収）
- **表示**は epoch ms から算出した残り秒に基づく

---

# 5. ブラインド構造（データ定義）

## 5.1 Structure
- Structureは全レベル共通の基本時間 `defaultDurationSeconds` を持つ
- データは `schemaVersion` を持つ
- Structureは空配列禁止（バリデーションで弾く）

## 5.2 Level種別
Levelは以下の2種類：
- `blind`
- `break`

共通仕様：
- breakも通常レベルと同様にカウントダウン
- breakが0秒に到達した場合、自動で次のレベルへ移行
- breakの時間も `defaultDurationSeconds` を適用し、必要に応じて個別上書き可能

## 5.3 Blindレベルのフィールド
- `gameType`: `FL` / `NL` / `PL` / `STUD`
- 共通フィールド：
  - `sb`
  - `bb`
  - `ante`
- STUDのUI表示のみ：
  - `sb` → Bring-in
  - `bb` → Completion
  - ※内部値は `sb` / `bb` のまま保持
- STUDでも `ante` は入力する

## 5.4 Duration
- 内部は秒で保持する
- UI入力は分を基本とし、内部へ変換して保持する
- Levelごとに `durationSecondsOverride?` を持てる（未指定なら `defaultDurationSeconds`）
- 未指定時：`defaultDurationSeconds` を適用

## 5.5 表示ラベル（自動生成）
- 表示用の番号は `blind` のみを 1..N で自動生成
- `break` は番号に含めない（表示名は `"Break"`）
- 例：`... 5` と `6` の間に break を挿入 → `... 5 Break 6 ...`

## 5.6 バリデーション
- Structureは空配列禁止
- durationは **最小60秒以上**
- `sb` / `bb` / `ante` は **0以上の整数**
- `bb >= sb`
- `sb = 0` を許可

---

# 6. 永続化仕様（確定）

## 6.1 永続化の責務分離
永続化対象を以下に分離する：
- **Structure**: ブラインド構成（編集結果）
- **Settings**: ユーザー設定（例：音量/ミュート等 ※詳細はTODO）
- **Session**: 実行状態（復元可能な最小情報）

※ Domainは localStorage / Date に直接依存しない。Usecaseは Port（Interface）越しに I/O する。

## 6.2 保存先
- 保存先は **localStorage** とする（PWA前提のローカル永続化）
- key は namespace を付ける（例：`poker-timer/*`）

## 6.3 保存フォーマット（共通）
- JSON
- すべての永続データに `schemaVersion` を含める

## 6.4 Structureの保存
- `activeStructure` を1つ保持する（現フェーズ）
- `structureId` は安定ID（uuid等）
- **表示ラベル（blind連番や"Break"）は保存しない**（UIで都度生成）

## 6.5 Sessionの保存（epoch ms基準）
Sessionは「再起動後も時間がズレない」ために epoch ms ベースで保存する。

保存する最小情報（例）：
- `structureId`
- `state`: `running` / `paused`（`idle` は保存しない）
- `currentLevelIndex`
- `levelStartedAtEpochMs`
- `pausedAtEpochMs?`
- `accumulatedPausedMs`（合計一時停止時間）

ルール：
- `idle` に遷移したら Session を削除する
- 起動時に Session が存在する場合、復元後に `nowEpochMs` を用いて残り時間を再計算する
- 復元時の整合処理（reconcile）は **1回だけ**行う
- 復元直後の reconcile では **音を鳴らさない**（hydration中の副作用禁止）

---

# 7. 構成供給（Editor未実装の暫定確定）

Editor未実装でも Timer が開始できるよう、Structureの供給元を確定する。

- アプリには **既定Structure（バンドル）** を同梱する
- 起動時：
  1) localStorage に `activeStructure` があればそれを採用  
  2) なければ **既定Structure** を採用（初回起動）
- Timer画面から **既定Structureへリセット**できる（確認ダイアログ等のUI詳細はTODO）

---

# 8. Editor仕様（TODO）
- Editorは別画面で実装する（現フェーズでは実装しない）
- 仕様としては以下を将来検討：
  - 複数Structure管理の有無
  - 名前付け / コピー / 削除
  - import/export（保存フォーマット）
  - バリデーションのUI表現
  - 実行中編集の可否（現時点では想定しない）

