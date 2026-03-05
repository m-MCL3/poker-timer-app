import type { Clock } from "@/usecases/ports/clock";
import {
  TimerDefinition,
  TimerRuntime,
  TimerEntry,
  createInitialRuntime,
} from "@/domain/entities/timer";
import { GAME_KIND_ORDER, type GameKindId, type BlindTriple } from "@/domain/entities/blinds";
import type { TimerSnapshot } from "./timerSnapshot";

const clampNonNegative = (n: number) => (n < 0 ? 0 : n);

const formatValue = (v: number | null) => {
  if (v === null) return "-";
  if (v === 0) return "-";
  return String(v);
};

const labelsFor = (kind: GameKindId) => {
  if (kind === "stud") return { left: "Bring-in", mid: "Complete", right: "Ante" };
  return { left: "SB", mid: "BB", right: "Ante" };
};

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class TimerUsecase {
  private runtime: TimerRuntime;

  constructor(
    private def: TimerDefinition,
    private readonly clock: Clock
  ) {
    this.runtime = createInitialRuntime();
  }

  // -------------------------
  // Editor
  // -------------------------
  getDefinition(): TimerDefinition {
    return deepClone(this.def);
  }

  canEditStructure(): boolean {
    return this.runtime.status !== "running";
  }

  applyEditedDefinition(next: TimerDefinition): void {
    if (!this.canEditStructure()) {
      throw new Error("Timer is running.\nStructure cannot be applied.");
    }
    if (!next.entries || next.entries.length === 0) {
      throw new Error("TimerDefinition.entries must not be empty.");
    }

    const oldEntryIndex = this.runtime.entryIndex;
    const newEntryIndex = Math.min(oldEntryIndex, next.entries.length - 1);

    const oldDuration = this.def.entries[oldEntryIndex]?.durationMs ?? 0;
    const newDuration = next.entries[newEntryIndex]?.durationMs ?? 0;

    this.def = deepClone(next);

    if (this.runtime.status === "idle") {
      this.runtime = {
        status: "idle",
        entryIndex: newEntryIndex,
        endsAtEpochMs: null,
        remainingMs: null,
      };
      return;
    }

    if (this.runtime.status === "paused") {
      // A仕様: 残り時間は短縮だけ許可（延長しない）
      const currentRemaining = this.runtime.remainingMs ?? oldDuration;
      const clamped = currentRemaining > newDuration ? newDuration : currentRemaining;
      this.runtime = {
        status: "paused",
        entryIndex: newEntryIndex,
        endsAtEpochMs: null,
        remainingMs: clamped,
      };
      return;
    }

    if (this.runtime.status === "finished") {
      this.runtime = {
        status: "idle",
        entryIndex: newEntryIndex,
        endsAtEpochMs: null,
        remainingMs: null,
      };
      return;
    }
  }

  // -------------------------
  // Timer operations
  // -------------------------
  toggleStartStop(): void {
    const now = this.clock.nowEpochMs();

    if (this.runtime.status === "idle") {
      this.startEntryFromFullDuration(now);
      return;
    }

    if (this.runtime.status === "running") {
      const remaining = this.computeRemainingMs(now);
      this.runtime = { ...this.runtime, status: "paused", endsAtEpochMs: null, remainingMs: remaining };
      return;
    }

    if (this.runtime.status === "paused") {
      const remaining = this.runtime.remainingMs ?? this.currentEntryDurationMs();
      this.runtime = { ...this.runtime, status: "running", endsAtEpochMs: now + remaining, remainingMs: null };
      return;
    }

    if (this.runtime.status === "finished") {
      this.runtime = createInitialRuntime();
    }
  }

  tick(): void {
    const now = this.clock.nowEpochMs();
    if (this.runtime.status !== "running") return;

    const remaining = this.computeRemainingMs(now);
    if (remaining > 0) return;

    const nextIndex = this.runtime.entryIndex + 1;
    if (nextIndex >= this.def.entries.length) {
      this.runtime = { ...this.runtime, status: "finished", endsAtEpochMs: null, remainingMs: null };
      return;
    }

    const duration = this.def.entries[nextIndex].durationMs;
    this.runtime = { status: "running", entryIndex: nextIndex, endsAtEpochMs: now + duration, remainingMs: null };
  }

  getSnapshot(): TimerSnapshot {
    const now = this.clock.nowEpochMs();
    const remainingMs = this.computeRemainingMs(now);

    const currentEntry = this.def.entries[this.runtime.entryIndex];
    const currentLevelForDisplay = this.pickLevelForDisplayAt(this.runtime.entryIndex);

    const currentBlinds = GAME_KIND_ORDER.map((kind) => ({
      kind,
      labels: labelsFor(kind),
      blinds: this.formatTriple(currentLevelForDisplay?.blinds?.[kind] ?? { sb: null, bb: null, ante: null }),
    }));

    const nextLevel = this.findNextLevelAfter(this.runtime.entryIndex);
    const nextLevelText = nextLevel ? this.buildNextLevelText(nextLevel.blinds) : "（最終レベル）";

    return {
      title: this.def.title,
      status: this.runtime.status,
      levelIndex: this.computeLevelIndexForBoard(this.runtime.entryIndex),
      levelCount: this.countLevels(),
      remainingMs,
      currentBlinds,
      nextLevelText,
    };
  }

  // -------------------------
  // Menu actions
  // -------------------------
  resetToIdle(): void {
    this.runtime = createInitialRuntime();
  }

  goToNextLevel(): void {
    const now = this.clock.nowEpochMs();
    const nextEntryIndex = this.findNextLevelEntryIndexAfter(this.runtime.entryIndex);
    if (nextEntryIndex === null) return;
    this.applyEntryChange(nextEntryIndex, now);
  }

  goToPreviousLevel(): void {
    const now = this.clock.nowEpochMs();
    const prevEntryIndex = this.findPrevLevelEntryIndexBefore(this.runtime.entryIndex);
    if (prevEntryIndex === null) return;
    this.applyEntryChange(prevEntryIndex, now);
  }

  // -------------------------
  // Internal
  // -------------------------
  private applyEntryChange(newEntryIndex: number, now: number): void {
    const duration = this.def.entries[newEntryIndex].durationMs;
    const baseStatus = this.runtime.status === "finished" ? "idle" : this.runtime.status;

    if (baseStatus === "running") {
      this.runtime = { status: "running", entryIndex: newEntryIndex, endsAtEpochMs: now + duration, remainingMs: null };
      return;
    }
    if (baseStatus === "paused") {
      this.runtime = { status: "paused", entryIndex: newEntryIndex, endsAtEpochMs: null, remainingMs: duration };
      return;
    }
    this.runtime = { status: "idle", entryIndex: newEntryIndex, endsAtEpochMs: null, remainingMs: null };
  }

  private startEntryFromFullDuration(now: number) {
    const duration = this.currentEntryDurationMs();
    this.runtime = { status: "running", entryIndex: this.runtime.entryIndex, endsAtEpochMs: now + duration, remainingMs: null };
  }

  private currentEntryDurationMs(): number {
    const e = this.def.entries[this.runtime.entryIndex];
    return e?.durationMs ?? 0;
  }

  private computeRemainingMs(now: number): number {
    if (this.runtime.status === "running") {
      const endsAt = this.runtime.endsAtEpochMs ?? now;
      return clampNonNegative(endsAt - now);
    }
    if (this.runtime.status === "paused") {
      return clampNonNegative(this.runtime.remainingMs ?? this.currentEntryDurationMs());
    }
    if (this.runtime.status === "idle") {
      return this.currentEntryDurationMs();
    }
    return 0;
  }

  private formatTriple(t: BlindTriple) {
    return { sb: formatValue(t.sb), bb: formatValue(t.bb), ante: formatValue(t.ante) };
  }

  private buildNextLevelText(blinds: Record<GameKindId, BlindTriple>): string {
    const parts = GAME_KIND_ORDER.map((k) => {
      const t = this.formatTriple(blinds[k]);
      const label = k.toUpperCase();
      return `${label}: ${t.sb} / ${t.bb} ( ${t.ante} )`;
    });
    return parts.join(" | ");
  }

  private countLevels(): number {
    return this.def.entries.filter((e) => e.kind === "level").length;
  }

  private computeLevelIndexForBoard(entryIndex: number): number {
    // TimerBoard は 0-based の levelIndex を要求。Break はカウントしない（A）
    let idx = -1;
    for (let i = 0; i <= entryIndex; i++) {
      if (this.def.entries[i].kind === "level") idx++;
    }
    // 先頭がbreak等で idx=-1 になったら 0 に寄せる
    return Math.max(0, idx);
  }

  private pickLevelForDisplayAt(entryIndex: number): TimerEntry & { kind: "level" } | null {
    // 表示上は、Break中は「直前のLevel」を優先。無ければ直後のLevel。
    const cur = this.def.entries[entryIndex];
    if (cur?.kind === "level") return cur;

    for (let i = entryIndex - 1; i >= 0; i--) {
      const e = this.def.entries[i];
      if (e.kind === "level") return e;
    }
    for (let i = entryIndex + 1; i < this.def.entries.length; i++) {
      const e = this.def.entries[i];
      if (e.kind === "level") return e;
    }
    return null;
  }

  private findNextLevelAfter(entryIndex: number): (TimerEntry & { kind: "level" }) | null {
    for (let i = entryIndex + 1; i < this.def.entries.length; i++) {
      const e = this.def.entries[i];
      if (e.kind === "level") return e;
    }
    return null;
  }

  private findNextLevelEntryIndexAfter(entryIndex: number): number | null {
    for (let i = entryIndex + 1; i < this.def.entries.length; i++) {
      if (this.def.entries[i].kind === "level") return i;
    }
    return null;
  }

  private findPrevLevelEntryIndexBefore(entryIndex: number): number | null {
    for (let i = entryIndex - 1; i >= 0; i--) {
      if (this.def.entries[i].kind === "level") return i;
    }
    return null;
  }
}