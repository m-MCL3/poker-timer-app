export type CancelableTask = {
  cancel: () => void;
};

export type IntervalScheduler = {
  start: (callback: () => void, intervalMs: number) => CancelableTask;
};
