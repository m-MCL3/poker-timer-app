import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const nav = useNavigate();

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 text-white">
      <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <button
            type="button"
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200"
            onClick={() => nav(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="mt-6 text-sm text-zinc-300">
          ここに設定UI（モック）。
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            Sound（TODO）
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            Alerts（TODO）
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            Theme（TODO）
          </div>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          ※ タブレット考慮でまずは別画面（route）。後でデスクトップのみダイアログ化も可能。
        </div>
      </div>
    </div>
  );
}
