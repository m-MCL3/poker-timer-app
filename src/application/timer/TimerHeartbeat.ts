import type { IntervalScheduler } from "@/application/shared/ports/IntervalScheduler";
import { TimerService } from "@/application/timer/TimerService";

export class TimerHeartbeat {
  private stopTimer: (() => void) | null = null;

  constructor(
    private readonly deps: {
      scheduler: IntervalScheduler;
      timerService: TimerService;
      intervalMs: number;
    },
  ) {}

  start(): () => void {
    this.stop();
    this.stopTimer = this.deps.scheduler.start(() => {
      this.deps.timerService.tick();
    }, this.deps.intervalMs);
    return () => this.stop();
  }

  stop(): void {
    this.stopTimer?.();
    this.stopTimer = null;
  }
}
