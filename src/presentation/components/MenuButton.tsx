import { useEffect, useRef, useState } from "react";

type MenuItem = {
  label: string;
  onSelect: () => void;
};

export default function MenuButton({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="menu-root" ref={rootRef}>
      <button className="ghost-button menu-trigger" onClick={() => setOpen((value) => !value)}>
        ☰
      </button>
      {open ? (
        <div className="menu-panel surface">
          {items.map((item) => (
            <button
              key={item.label}
              className="menu-item"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
