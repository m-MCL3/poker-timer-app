import type { CancelableTask, IntervalScheduler } from "@/usecases/ports/intervalScheduler";

class BrowserIntervalTask implements CancelableTask {
  constructor(private readonly timerId: number) {}

  cancel(): void {
    window.clearInterval(this.timerId);
  }
}

export class BrowserIntervalScheduler implements IntervalScheduler {
  start(task: () => void, intervalMs: number): CancelableTask {
    const timerId = window.setInterval(task, intervalMs);
    return new BrowserIntervalTask(timerId);
  }
}
