import type { IntervalScheduler } from "@/application/shared/ports/IntervalScheduler";

export class BrowserIntervalScheduler implements IntervalScheduler {
  start(callback: () => void, intervalMs: number): () => void {
    const timerId = window.setInterval(callback, intervalMs);
    return () => window.clearInterval(timerId);
  }
}
