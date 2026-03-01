import { useCallback, useEffect, useState } from "react";

type UseTimerControlArgs = {
  durationSec: number;
  onExpire: () => void;
};

type UseTimerControlReturn = {
  running: boolean;
  timeLeft: number;
  hasStartedOnce: boolean;
  showPause: boolean;

  start: () => void;
  stop: () => void;
  toggleRunning: () => void;

  reset: () => void; // 停止 + durationSecに戻す（開始済みフラグも初期化）
};

export function useTimerControl({
  durationSec,
  onExpire,
}: UseTimerControlArgs): UseTimerControlReturn {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  // durationSecが変わったら、そのレベルの時間に戻す（旧挙動維持）
  useEffect(() => {
    setTimeLeft(durationSec);
  }, [durationSec]);

  // カウントダウン
  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onExpire();
          return 1; // 旧挙動踏襲
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, onExpire]);

  const start = useCallback(() => {
    setRunning(true);
    setHasStartedOnce(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const toggleRunning = useCallback(() => {
    setRunning((v) => {
      const nextRunning = !v;
      if (nextRunning) setHasStartedOnce(true);
      return nextRunning;
    });
  }, []);

  const reset = useCallback(() => {
    // Resetは「完全初期化」：停止＋残り時間をそのレベルに戻す
    setRunning(false);
    setTimeLeft(durationSec);
    setHasStartedOnce(false);
  }, [durationSec]);

  const showPause = !running && hasStartedOnce;

  return {
    running,
    timeLeft,
    hasStartedOnce,
    showPause,
    start,
    stop,
    toggleRunning,
    reset,
  };
}