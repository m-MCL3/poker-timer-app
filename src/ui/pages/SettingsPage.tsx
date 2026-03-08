import { useNavigate } from "react-router-dom";
import PageHeader from "@/ui/components/PageHeader";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="app-shell">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="タブレット運用も想定し、まずは route ベースの設定ページとして分離しています。"
        actions={
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            ← Back
          </button>
        }
      />

      <section className="surface settings-grid">
        <div className="settings-item">
          <h2 className="section-title">Sound</h2>
          <p className="text-muted">ブラインドアップ通知、Break開始通知、音量設定を後続フェーズで追加します。</p>
        </div>
        <div className="settings-item">
          <h2 className="section-title">Alerts</h2>
          <p className="text-muted">残り1分、残り10秒などの事前通知ルールをここに集約します。</p>
        </div>
        <div className="settings-item">
          <h2 className="section-title">Theme</h2>
          <p className="text-muted">現段階ではダーク基調で固定し、将来ここにUIテーマ設定を追加します。</p>
        </div>
      </section>
    </main>
  );
}
