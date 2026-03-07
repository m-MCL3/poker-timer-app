# Timer Usecases

## 1. 役割

TimerUsecase は、`TimerState` と `nowEpochMs` を入力として、新しい `TimerState` または `TimerSnapshot` を作る責務を持つ。

---

## 2. 基本方針

Usecase は可能な限り次の形にそろえる。

```text
input → newState
```

この方針により、テストしやすく、UI 非依存で、振る舞いを一箇所に閉じ込められる。

---

## 3. 主な関数

### startTimer
idle 状態などから running を開始する。

### pauseTimer
running から paused に遷移し、残り時間を保持する。

### resumeTimer
paused から running に戻す。

### toggleTimer
現在状態に応じて start / pause / resume / reset 的な挙動を選ぶ。

### tickTimer
現在時刻に基づいてタイマーを進める。

### goToNextItem / goToPreviousItem
手動移動を行う。Break も対象に含む。

### resetTimer
structure を維持したまま初期状態に戻す。

### replaceTournamentStructure
Editor などから構造を差し替える。

### createTimerSnapshot
UI 表示用情報を生成する。

---

## 4. tickTimer で大事なこと

`tickTimer` は単純に remaining を 1秒減らす関数ではない。  
現在時刻との差分で状態を再計算する関数である。

この考え方により、ブラウザのタブが止まっても次回復帰時に整合が取りやすい。

---

## 5. Break をどう扱うか

TimerUsecase では Break を例外扱いしない。  
item.kind を見て、

- 表示ラベル
- blinds 表示有無
- next item text

を切り替えるだけにする。

遷移単位はあくまで item。
