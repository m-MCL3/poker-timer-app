import { Clock } from "@/usecases/ports/clock";

export class SystemClock implements Clock {
  nowEpochMs(): number {
    return Date.now();
  }
}