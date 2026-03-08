import type {
  CancelableTask,
  IntervalScheduler,
} from "@/usecases/ports/intervalScheduler";

export class BrowserIntervalScheduler implements IntervalScheduler {
  start(callback: () => void, intervalMs: number): CancelableTask {
    const handle = window.setInterval(callback, intervalMs);
    return {
      cancel: () => window.clearInterval(handle),
    };
  }
}
