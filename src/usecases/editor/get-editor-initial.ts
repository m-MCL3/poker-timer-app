import type { TimerReader } from "@/usecases/ports/timer-reader";

export type EditorInitial = {
  snapshot: ReturnType<TimerReader["getSnapshot"]>;
  isEditable: boolean;
};

export function getEditorInitial(timer: TimerReader): EditorInitial {
  const snapshot = timer.getSnapshot();
  return { snapshot, isEditable: snapshot.state !== "running" };
}