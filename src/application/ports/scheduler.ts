export interface Scheduler {
  setInterval(callback: () => void, intervalMs: number): number;
  clearInterval(handleId: number): void;
}
