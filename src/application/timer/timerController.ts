import type { Scheduler } from "@/application/ports/scheduler";
import { TimerSessionService } from "@/application/timer/timerSessionService";

export class TimerController {
  private handleId: number | null = null;

  constructor(
    private readonly timerSessionService: TimerSessionService,
    private readonly scheduler: Scheduler,
    private readonly intervalMs: number = 250,
  ) {}

  start(): () => void {
    this.stop();
    this.handleId = this.scheduler.setInterval(() => {
      this.timerSessionService.tick();
    }, this.intervalMs);

    return () => this.stop();
  }

  stop(): void {
    if (this.handleId === null) {
      return;
    }

    this.scheduler.clearInterval(this.handleId);
    this.handleId = null;
  }
}
