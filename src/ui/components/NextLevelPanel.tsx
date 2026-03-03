export default function NextLevelPanel(props: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-3">
      <div className="text-xs text-zinc-400">Next Level</div>
      <div className="mt-1 text-sm text-zinc-200 break-words">{props.text}</div>
    </div>
  );
}