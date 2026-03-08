export interface CancelableTask {
  cancel(): void;
}

export interface IntervalScheduler {
  start(task: () => void, intervalMs: number): CancelableTask;
}
