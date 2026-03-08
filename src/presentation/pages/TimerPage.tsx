import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TimerBoard from "@/presentation/components/TimerBoard";
import MenuButton from "@/presentation/components/MenuButton";
import NextItemPanel from "@/presentation/components/NextItemPanel";
import BlindsPanel from "@/presentation/components/BlindsPanel";
import { useAppContainer } from "@/app/composition/containerContext";
import { useSubscription } from "@/presentation/hooks/useSubscription";

export default function TimerPage() {
  const navigate = useNavigate();
  const { timerService } = useAppContainer();
  useSubscription((listener) => timerService.subscribe(listener));

  const snapshot = timerService.getView();

  const onReset = () => {
    if (window.confirm("タイマーを初期状態に戻しますか？")) {
      timerService.reset();
    }
  };

  const menuItems = useMemo(
    () => [
      { label: "Previous", onSelect: () => timerService.goToPreviousItem() },
      { label: "Next", onSelect: () => timerService.goToNextItem() },
      { label: "Reset", onSelect: onReset },
      { label: "Edit Structure", onSelect: () => navigate("/editor") },
      { label: "Settings", onSelect: () => navigate("/settings") },
    ],
    [navigate, timerService],
  );

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Poker Timer</p>
          <h1>{snapshot.title}</h1>
          <p className="text-muted">タイマー制御と表示は分離済みです。画面側は View の描画だけに寄せています。</p>
        </div>
        <MenuButton items={menuItems} />
      </header>

      <section className="timer-layout">
        <div className="surface timer-main-panel">
          <TimerBoard snapshot={snapshot} onToggle={() => timerService.toggle()} />
        </div>

        <aside className="timer-side-panel">
          <NextItemPanel nextItemText={snapshot.nextItemText} nextBreakText={snapshot.nextBreakText} />

          {snapshot.showBreakBanner ? (
            <section className="surface card break-banner">
              <h2>Break Time</h2>
              <p className="text-muted">休憩中です。タップで開始するとこの項目から再開します。</p>
            </section>
          ) : null}

          {snapshot.currentBlindGroups.length > 0 ? <BlindsPanel groups={snapshot.currentBlindGroups} /> : null}
        </aside>
      </section>
    </main>
  );
}
