import { TimerUsecase } from "@/usecases/timer/timerUsecase";

export class TimerController {
  private timerId: number | null = null;

  constructor(
    private readonly timerUsecase: TimerUsecase,
    private readonly intervalMs: number = 250,
  ) {}

  start(): () => void {
    this.stop();
    this.timerId = window.setInterval(() => {
      this.timerUsecase.tick();
    }, this.intervalMs);

    return () => this.stop();
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
