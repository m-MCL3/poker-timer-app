import { Clock } from "@/usecases/ports/clock";
import {
  TimerDefinition,
  TimerRuntime,
  createInitialRuntime,
} from "@/domain/entities/timer";
import {
  GAME_KIND_ORDER,
  GameKindId,
  BlindTriple,
} from "@/domain/entities/blinds";
import { TimerSnapshot } from "./timerSnapshot";

const clampNonNegative = (n: number) => (n < 0 ? 0 : n);

const formatValue = (v: number | null) => {
  if (v === null) return "-";
  if (v === 0) return "-"; // 表示上は "-" に寄せる（仕様が変わるならここ）
  return String(v);
};

const labelsFor = (kind: GameKindId) => {
  // キーは常に sb/bb/ante だが、STUDだけ表示ラベルを差し替える
  if (kind === "stud") return { left: "Bring-in", mid: "Complete", right: "Ante" };
  return { left: "SB", mid: "BB", right: "Ante" };
};

// Editorが直接参照するので “安全な複製” を返す
const deepClone = <T,>(v: T): T => {
  // domain定義がJSONに落ちる前提（現状の構造ならOK）
  return JSON.parse(JSON.stringify(v)) as T;
};

export class TimerUsecase {
  private runtime: TimerRuntime;

  constructor(
    private def: TimerDefinition,
    private readonly clock: Clock
  ) {
    this.runtime = createInitialRuntime();
  }

  /**
   * Editor: 現在の構成（ロード済み or デフォルト）を取得
   */
  getDefinition(): TimerDefinition {
    return deepClone(this.def);
  }

  /**
   * Editor: running中は編集不可（参照のみ）
   */
  canEditStructure(): boolean {
    return this.runtime.status !== "running";
  }

  /**
   * Editor: 編集した構成を適用
   * - running中は拒否
   * - A仕様: 残り時間は「短縮だけ許可」、延長はしない
   */
  applyEditedDefinition(next: TimerDefinition): void {
    if (!this.canEditStructure()) {
      throw new Error("Timer is running. Structure cannot be applied.");
    }
    if (!next.levels || next.levels.length === 0) {
      throw new Error("TimerDefinition.levels must not be empty.");
    }

    const oldIndex = this.runtime.levelIndex;
    const newIndex = Math.min(oldIndex, next.levels.length - 1);

    const oldDuration = this.def.levels[oldIndex]?.durationMs ?? 0;
    const newDuration = next.levels[newIndex]?.durationMs ?? 0;

    // def 差し替え
    this.def = deepClone(next);

    // runtime調整
    if (this.runtime.status === "idle") {
      this.runtime = {
        status: "idle",
        levelIndex: newIndex,
        endsAtEpochMs: null,
        remainingMs: null,
      };
      return;
    }

    if (this.runtime.status === "paused") {
      // A仕様: remaining は短縮のみ（remaining > newDuration のときだけ clamp）
      const currentRemaining = this.runtime.remainingMs ?? oldDuration;
      const clamped = currentRemaining > newDuration ? newDuration : currentRemaining;

      this.runtime = {
        status: "paused",
        levelIndex: newIndex,
        endsAtEpochMs: null,
        remainingMs: clamped,
      };
      return;
    }

    if (this.runtime.status === "finished") {
      // finishedは編集できる扱い。とりあえず idle に戻して表示を整える
      this.runtime = {
        status: "idle",
        levelIndex: newIndex,
        endsAtEpochMs: null,
        remainingMs: null,
      };
      return;
    }

    // running は上で弾いてるので到達しない
  }

  /**
   * 画面タップ操作: Start/Stop(=Pause) トグル
   * - idle -> running（レベル時間で開始）
   * - running -> paused（残り固定）
   * - paused -> running（残りから再開）
   * - finished -> idle（最小挙動）
   */
  toggleStartStop(): void {
    const now = this.clock.nowEpochMs();

    if (this.runtime.status === "idle") {
      this.startLevelFromFullDuration(now);
      return;
    }

    if (this.runtime.status === "running") {
      const remaining = this.computeRemainingMs(now);
      this.runtime = {
        ...this.runtime,
        status: "paused",
        endsAtEpochMs: null,
        remainingMs: remaining,
      };
      return;
    }

    if (this.runtime.status === "paused") {
      const remaining = this.runtime.remainingMs ?? this.currentLevelDurationMs();
      this.runtime = {
        ...this.runtime,
        status: "running",
        endsAtEpochMs: now + remaining,
        remainingMs: null,
      };
      return;
    }

    if (this.runtime.status === "finished") {
      this.runtime = createInitialRuntime();
    }
  }

  /**
   * UIのタイマー更新（setInterval等から呼ぶ）
   * - running中のみ監視
   * - 0秒到達で次レベルへ
   * - 最終レベルは finished で停止（ループしない）
   */
  tick(): void {
    const now = this.clock.nowEpochMs();
    if (this.runtime.status !== "running") return;

    const remaining = this.computeRemainingMs(now);
    if (remaining > 0) return;

    const nextIndex = this.runtime.levelIndex + 1;
    if (nextIndex >= this.def.levels.length) {
      this.runtime = {
        ...this.runtime,
        status: "finished",
        endsAtEpochMs: null,
        remainingMs: null,
      };
      return;
    }

    const duration = this.def.levels[nextIndex].durationMs;
    this.runtime = {
      status: "running",
      levelIndex: nextIndex,
      endsAtEpochMs: now + duration,
      remainingMs: null,
    };
  }

  getSnapshot(): TimerSnapshot {
    const now = this.clock.nowEpochMs();
    const remainingMs = this.computeRemainingMs(now);
    const current = this.def.levels[this.runtime.levelIndex];

    const currentBlinds = GAME_KIND_ORDER.map((kind) => ({
      kind,
      labels: labelsFor(kind),
      blinds: this.formatTriple(current.blinds[kind]),
    }));

    const nextIndex = this.runtime.levelIndex + 1;
    const next = nextIndex < this.def.levels.length ? this.def.levels[nextIndex] : null;

    const nextLevelText = next ? this.buildNextLevelText(next.blinds) : "（最終レベル）";

    return {
      title: this.def.title,
      status: this.runtime.status,
      levelIndex: this.runtime.levelIndex,
      levelCount: this.def.levels.length,
      remainingMs,
      currentBlinds,
      nextLevelText,
    };
  }

  // ----------------------------------------------------------------
  // Menu actions (spec-confirmed)
  // ----------------------------------------------------------------

  /** Reset: idleに戻す（確認ダイアログはUI側で必須） */
  resetToIdle(): void {
    this.runtime = createInitialRuntime();
  }

  /** Next Level: 残り時間リセット。running/pausedは状態維持。 */
  goToNextLevel(): void {
    const now = this.clock.nowEpochMs();
    const nextIndex = this.runtime.levelIndex + 1;
    if (nextIndex >= this.def.levels.length) return;
    this.applyLevelChange(nextIndex, now);
  }

  /** Previous Level: 残り時間リセット。running/pausedは状態維持。 */
  goToPreviousLevel(): void {
    const now = this.clock.nowEpochMs();
    const prevIndex = this.runtime.levelIndex - 1;
    if (prevIndex < 0) return;
    this.applyLevelChange(prevIndex, now);
  }

  // ----------------------------------------------------------------
  // Internal
  // ----------------------------------------------------------------

  private applyLevelChange(newIndex: number, now: number): void {
    const duration = this.def.levels[newIndex].durationMs;

    // finished中は操作系で戻す想定：idle扱いにして適用
    const baseStatus = this.runtime.status === "finished" ? "idle" : this.runtime.status;

    if (baseStatus === "running") {
      this.runtime = {
        status: "running",
        levelIndex: newIndex,
        endsAtEpochMs: now + duration,
        remainingMs: null,
      };
      return;
    }

    if (baseStatus === "paused") {
      this.runtime = {
        status: "paused",
        levelIndex: newIndex,
        endsAtEpochMs: null,
        remainingMs: duration,
      };
      return;
    }

    // idle
    this.runtime = {
      status: "idle",
      levelIndex: newIndex,
      endsAtEpochMs: null,
      remainingMs: null,
    };
  }

  private startLevelFromFullDuration(now: number) {
    const duration = this.currentLevelDurationMs();
    this.runtime = {
      status: "running",
      levelIndex: this.runtime.levelIndex,
      endsAtEpochMs: now + duration,
      remainingMs: null,
    };
  }

  private currentLevelDurationMs(): number {
    const lvl = this.def.levels[this.runtime.levelIndex];
    return lvl?.durationMs ?? 0;
  }

  private computeRemainingMs(now: number): number {
    if (this.runtime.status === "running") {
      const endsAt = this.runtime.endsAtEpochMs ?? now;
      return clampNonNegative(endsAt - now);
    }

    if (this.runtime.status === "paused") {
      return clampNonNegative(this.runtime.remainingMs ?? this.currentLevelDurationMs());
    }

    if (this.runtime.status === "idle") {
      return this.currentLevelDurationMs();
    }

    // finished
    return 0;
  }

  private formatTriple(t: BlindTriple) {
    return {
      sb: formatValue(t.sb),
      bb: formatValue(t.bb),
      ante: formatValue(t.ante),
    };
  }

  private buildNextLevelText(blinds: Record<GameKindId, BlindTriple>): string {
    // v1.0: Next Level は文字列表示でOK
    const parts = GAME_KIND_ORDER.map((k) => {
      const t = this.formatTriple(blinds[k]);
      const label = k.toUpperCase();
      return `${label}: ${t.sb} / ${t.bb} ( ${t.ante} )`;
    });
    return parts.join(" | ");
  }
}