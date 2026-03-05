# Timer Specification

本書は Poker Timer App の「確定仕様」を記載する。
本書に記載がない挙動は未確定であり、実装しない。

---

## 1. 用語

- **BlindStructure**: タイマーが参照するブラインド構造（レベル配列）
- **Level**: 1段階分のブラインド定義（時間 + ブラインド値）
- **currentLevelIndex**: 現在レベルのインデックス（0始まり）
- **remaining**: 現在レベルの残り時間
- **TimerState**: タイマーの状態

---

## 2. TimerState（状態）

TimerState は次のいずれか。

- `idle`
- `running`
- `paused`
- `finished`

---

## 3. データ構造

### 3.1 BlindStructure

BlindStructure は `levels: Level[]` を持つ。

### 3.2 Level

Level は以下を持つ。

- `durationSec: number`（このレベルの時間）
- `blinds`（種別ごとのブラインド）

### 3.3 Blinds（種別）

ブラインドは 3 種を常に扱う（表示上も消さない）。

- `fl`（Fixed Limit）
  - `sb`
  - `bb`
  - `ante`
- `stud`（Stud）
  - `bringIn`
  - `complete`
  - `ante`
- `nlpl`（No Limit / Pot Limit）
  - `sb`
  - `bb`
  - `nlAnte`

※ `fl/stud/nlpl` の枠自体（概念）は常に存在する。

---

## 4. 時間管理の基準

- 時間管理は **実時間（epoch ms）基準** とする。
- 表示は実時間から残り時間を計算して行う。

---

## 5. レベル進行仕様

### 5.1 0秒到達時

- `remaining` が 0 に到達した場合、**自動で次レベルへ移行**する。
- 最終レベル到達後は停止し、**ループしない**（`finished` となる）。

### 5.2 手動操作（次へ / 前へ）

- `Next Level` により次レベルへ進める。
- `Previous Level` により前レベルへ戻れる。
- 手動でレベル移動した場合、**残り時間はリセット**される。

---

## 6. 操作仕様（メニュー）

### 6.1 RESET

- `RESET` は `idle` に戻す。
- **確認ダイアログ必須**。

### 6.2 Next / Previous Level

- `Next Level` / `Previous Level` による移動時、**残り時間はリセット**される。

### 6.3 Edit Structure

- `Edit Structure` により Editor 画面へ遷移する。
- 保存（Save）・読み込み（Load）も Editor 側で行う。

### 6.4 Settings

- Settings は別画面またはダイアログとして表示する（UI形態は未確定）。
- 本書では Settings の詳細仕様は定義しない。

---

## 7. 画面表示に関する確定事項（仕様としての制約）

本書は基本的に「挙動仕様」を扱うが、以下は仕様として確定している。

- ブラインド表示は「1つのテキストに結合しない」。項目として分け、ズレないように表示する。
- ブラインド種別（`fl/stud/nlpl`）の文字列・区別は消さない（どれのブラインドか分からなくなるため）。
- `A / B / (C)` のような構造表示が存在する（意味の詳細は UI 側での表現として扱うが、要素の存在は維持する）。

---

## 8. 未確定事項

- ディーラーモード
- マルチユーザ
- サーバ保存
- サークル管理
- 通知
- その他 UI の詳細配置

未確定事項は `docs/roadmap.md` に記載し、仕様化された段階で本書へ反映する。