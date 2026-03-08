import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onResetRequested: () => void;
  onNextRequested: () => void;
  onPrevRequested: () => void;
};

export default function MenuButton(props: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!ref.current) {
        return;
      }
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const itemClass =
    "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-zinc-800/60 transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-lg shadow-sm hover:bg-zinc-800/80"
        aria-label="menu"
        title="Menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        ☰
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur">
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              props.onResetRequested();
            }}
          >
            Reset…
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              props.onNextRequested();
            }}
          >
            Next Level
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              props.onPrevRequested();
            }}
          >
            Previous Level
          </button>
          <div className="my-2 h-px bg-zinc-800" />
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              navigate("/editor");
            }}
          >
            Edit Structure…
          </button>
          <button
            type="button"
            className={itemClass}
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
