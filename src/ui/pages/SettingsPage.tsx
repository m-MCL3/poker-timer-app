import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[760px] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Settings</div>
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs"
            onClick={() => nav(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm text-zinc-300">
            ここに設定UI（モック）。
          </div>

          <div className="mt-4 grid gap-2">
            <button className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm opacity-60" disabled>
              Sound（TODO）
            </button>
            <button className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm opacity-60" disabled>
              Alerts（TODO）
            </button>
            <button className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm opacity-60" disabled>
              Theme（TODO）
            </button>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            ※ タブレット考慮でまずは別画面（route）。後でデスクトップのみダイアログ化も可能。
          </div>
        </div>
      </div>
    </div>
  );
}