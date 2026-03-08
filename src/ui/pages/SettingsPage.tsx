import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#09090b_55%,#000000_100%)] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </header>

        <button
          type="button"
          className="mb-6 rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900/60"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl">
          <p className="text-zinc-300">ここに設定UI（モック）。</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              Sound（TODO）
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              Alerts（TODO）
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              Theme（TODO）
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-500">
            ※ タブレット考慮でまずは別画面（route）。後でデスクトップのみダイアログ化も可能。
          </p>
        </section>
      </div>
    </main>
  );
}
