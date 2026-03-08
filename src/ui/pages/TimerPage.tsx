import BlindMatrix from "@/ui/components/BlindMatrix";
import NextQueueCard from "@/ui/components/NextQueueCard";
import PageHeader from "@/ui/components/PageHeader";
import TimerActionPanel from "@/ui/components/TimerActionPanel";
import TimerBoard from "@/ui/components/TimerBoard";
import { useTimerPageModel } from "@/ui/hooks/useTimerPageModel";

export default function TimerPage() {
  const model = useTimerPageModel();

  return (
    <main className="app-shell">
      <PageHeader
        eyebrow="Tournament Timer"
        title={model.snapshot.title}
        description="理想形アーキテクチャのモックとして、時間制御・編集・永続化をレイヤ分離しています。"
      />

      <div className="timer-grid">
        <div className="timer-main surface">
          <TimerBoard snapshot={model.snapshot} onToggle={model.onToggle} />
        </div>

        <div className="timer-side">
          <TimerActionPanel
            onPrev={model.onPrev}
            onNext={model.onNext}
            onReset={model.onReset}
            onOpenEditor={model.onOpenEditor}
            onOpenSettings={model.onOpenSettings}
          />
          <NextQueueCard
            nextItemText={model.snapshot.nextItemText}
            nextBreakText={model.snapshot.nextBreakText}
          />
          {model.snapshot.showBreakBanner ? (
            <section className="surface card">
              <h2>Break Time</h2>
              <p className="text-muted">休憩中です。再開するまでタイマーはこの項目に留まります。</p>
            </section>
          ) : null}
          {model.snapshot.currentBlindGroups.length > 0 ? (
            <BlindMatrix groups={model.snapshot.currentBlindGroups} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
