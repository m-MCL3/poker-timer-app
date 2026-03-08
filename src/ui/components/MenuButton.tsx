import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onResetRequested: () => void;
  onNextRequested: () => void;
  onPrevRequested: () => void;
};

export default function MenuButton(props: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  const itemClassName =
    "w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-zinc-800/70";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="menu"
        title="Menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="grid h-12 w-12 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950/70 text-xl text-white transition hover:border-cyan-400/40 hover:bg-zinc-900"
      >
        ☰
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-10 min-w-60 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur">
          <button
            type="button"
            className={itemClassName}
            onClick={() => {
              setOpen(false);
              props.onResetRequested();
            }}
          >
            Reset…
          </button>
          <button
            type="button"
            className={itemClassName}
            onClick={() => {
              setOpen(false);
              props.onNextRequested();
            }}
          >
            Next Level
          </button>
          <button
            type="button"
            className={itemClassName}
            onClick={() => {
              setOpen(false);
              props.onPrevRequested();
            }}
          >
            Previous Level
          </button>
          <div className="my-2 border-t border-zinc-800" />
          <button
            type="button"
            className={itemClassName}
            onClick={() => {
              setOpen(false);
              navigate("/editor");
            }}
          >
            Edit Structure…
          </button>
          <button
            type="button"
            className={itemClassName}
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
          >
            Settings…
          </button>
        </div>
      ) : null}
    </div>
  );
}
