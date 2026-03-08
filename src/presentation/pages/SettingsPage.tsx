import { Link } from "react-router-dom";

export default function SettingsPage() {
  return (
    <main className="page-shell narrow-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Settings Mock</h1>
          <p className="text-muted">
            設定画面は分離済みです。今後の通知、音声、表示テーマ、PWA設定の受け皿として残しています。
          </p>
        </div>
        <Link className="ghost-button" to="/timer">
          Timerへ戻る
        </Link>
      </header>

      <section className="surface card">
        <h2>このリファクタでの位置づけ</h2>
        <p>
          ここは presentation 層の独立ページとして配置し、アプリケーションルールを持たせない構成にしています。
        </p>
      </section>
    </main>
  );
}
