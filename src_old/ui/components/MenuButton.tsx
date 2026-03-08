import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MenuButton(props: {
  onResetRequested: () => void;
  onNextRequested: () => void;
  onPrevRequested: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current) {
        return;
      }
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const itemBase =
    "w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800/60";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-200"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="menu"
        title="Menu"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-lg">
          <button
            className={itemBase}
            onClick={() => {
              setOpen(false);
              props.onResetRequested();
            }}
          >
            Reset…
          </button>

          <button
            className={itemBase}
            onClick={() => {
              setOpen(false);
              props.onNextRequested();
            }}
          >
            Next Level
          </button>

          <button
            className={itemBase}
            onClick={() => {
              setOpen(false);
              props.onPrevRequested();
            }}
          >
            Previous Level
          </button>

          <div className="my-2 h-px bg-zinc-800" />

          <button
            className={itemBase}
            onClick={() => {
              setOpen(false);
              nav("/editor");
            }}
          >
            Edit Structure…
          </button>

          <div className="my-2 h-px bg-zinc-800" />

          <button
            className={itemBase}
            onClick={() => {
              setOpen(false);
              nav("/settings");
            }}
          >
            Settings…
          </button>
        </div>
      )}
    </div>
  );
}
