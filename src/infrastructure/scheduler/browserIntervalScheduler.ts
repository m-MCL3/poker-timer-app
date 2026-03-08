import type { Scheduler } from "@/application/ports/scheduler";

export class BrowserIntervalScheduler implements Scheduler {
  setInterval(callback: () => void, intervalMs: number): number {
    return window.setInterval(callback, intervalMs);
  }

  clearInterval(handleId: number): void {
    window.clearInterval(handleId);
  }
}
