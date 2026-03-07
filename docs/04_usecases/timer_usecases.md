# Timer Usecases

## 1. 役割

TimerUsecase は TimerState と nowEpochMs を入力に取り、新しい TimerState または TimerSnapshot を返す。

## 2. 基本方針

Usecase は可能な限り次の形にそろえる。

- input → newState
- input → snapshot

これによりテストしやすく、UI 非依存になる。

## 3. 主な関数

### startTimer
現在 item のフル時間で running を開始する。

### pauseTimer
running を paused にし、その時点の残り時間を保持する。

### resumeTimer
pausedRemainingMs を基準に running を再開する。

### toggleTimer
現在 status に応じて start / pause / resume / reset 的挙動を切り替える。

### tickTimer
nowEpochMs に基づいて現在 item を進行させ、必要なら次 item へ進める。

### goToNextItem / goToPreviousItem
手動で item を移動する。Break も対象に含む。

### resetTimer
structure を維持したまま初期状態に戻す。

### replaceTournamentStructure
Editor などで作った新 structure を Timer に適用する。

### createTimerSnapshot
UI 表示用の TimerSnapshot を生成する。

## 4. 重要な考え方

tickTimer は「remaining を 1秒減らす処理」ではない。  
**現在時刻を与えて、その時点の正しい状態に追いつかせる処理**である。

## 5. Break の扱い

Break は遷移対象 item の一つであり、特別扱いしない。  
特別なのは表示だけであり、Usecase 内では `item.kind` により snapshot の表示フラグを決める。
