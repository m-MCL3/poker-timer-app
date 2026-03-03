import { NotificationPort } from "@/usecases/ports/notifications";

export class ConsoleNotify implements NotificationPort {
  notify(message: string): void {
    // 将来: toast / audio / vibration などに差し替え
    // 今は空箱
    console.log(message);
  }
}