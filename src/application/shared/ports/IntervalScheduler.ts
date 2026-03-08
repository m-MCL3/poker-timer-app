export interface IntervalScheduler {
  start(callback: () => void, intervalMs: number): () => void;
}
