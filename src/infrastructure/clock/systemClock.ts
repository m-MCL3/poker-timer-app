import type { Clock } from "@/application/ports/clock";

export class SystemClock implements Clock {
  nowEpochMs(): number {
    return Date.now();
  }
}
