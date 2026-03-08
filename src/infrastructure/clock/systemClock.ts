import type { Clock } from "@/application/shared/ports/Clock";

export class SystemClock implements Clock {
  nowEpochMs(): number {
    return Date.now();
  }
}
