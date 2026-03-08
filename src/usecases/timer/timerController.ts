import type {
  CancelableTask,
  IntervalScheduler,
} from "@/usecases/ports/intervalScheduler";
import { TimerUsecase } from "@/usecases/timer/timerUsecase";

export class TimerController {
  private tickerTask: CancelableTask | null = null;

  constructor(
    private readonly deps: {
      scheduler: IntervalScheduler;
      timerUsecase: TimerUsecase;
      tickIntervalMs?: number;
    },
  ) {}

  start(): () => void {
    if (this.tickerTask) {
      return () => this.stop();
    }

    this.tickerTask = this.deps.scheduler.start(() => {
      this.deps.timerUsecase.tick();
    }, this.deps.tickIntervalMs ?? 250);

    return () => this.stop();
  }

  stop(): void {
    if (!this.tickerTask) {
      return;
    }

    this.tickerTask.cancel();
    this.tickerTask = null;
  }
}
