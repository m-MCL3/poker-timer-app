import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          ← Back
        </button>

        <section className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="text-xs tracking-[0.35em] text-cyan-200/70">SETTINGS</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            ここに設定UIを実装していく前提のモックです。タブレット運用を考慮して、まずは別画面ルートで保持しています。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm font-medium text-white">Sound</div>
              <div className="mt-2 text-sm text-zinc-500">TODO</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm font-medium text-white">Alerts</div>
              <div className="mt-2 text-sm text-zinc-500">TODO</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-sm font-medium text-white">Theme</div>
              <div className="mt-2 text-sm text-zinc-500">TODO</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
