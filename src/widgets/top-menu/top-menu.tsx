import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
  );
}

function MenuItem({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <div
      style={{
        padding: "10px 10px",
        borderRadius: 10,
        border: "1px solid transparent",
        cursor: "pointer",
        userSelect: "none",
        fontWeight: 800,
        opacity: 0.95,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#223047";
        e.currentTarget.style.background = "#111827";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.background = "transparent";
      }}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

export default function TopMenu(props: {
  onToggleRunning: () => void;
  onReset: () => void;
  onNextLevel: () => void;
  onPrevLevel: () => void;
}) {
  const { onReset, onNextLevel, onPrevLevel } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const closeAnd =
    (fn: () => void) =>
    () => {
      fn();
      setMenuOpen(false);
    };

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 50,
        width: 42,
        height: 42,
      }}
      onClick={stop}
    >
      <div style={{ position: "relative", width: 42, height: 42 }}>
        <button
          type="button"
          aria-label="menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: "1px solid #223047",
            background: "#0f172a",
            color: "#e6edf3",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            padding: 0,
            appearance: "none",
            WebkitAppearance: "none",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            transform: "translateZ(0)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <MenuIcon />
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 42 + 8,
              width: 220,
              background: "#0f172a",
              border: "1px solid #223047",
              borderRadius: 14,
              padding: 10,
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            }}
            onClick={stop}
          >
            <MenuItem text="Reset" onClick={closeAnd(onReset)} />
            <MenuItem text="Next Level" onClick={closeAnd(onNextLevel)} />
            <MenuItem text="Prev Level" onClick={closeAnd(onPrevLevel)} />
            <div style={{ height: 1, background: "#223047", margin: "8px 0" }} />
            <MenuItem
              text="Edit Blinds"
              onClick={closeAnd(() => navigate("/editor"))}
            />

            <MenuItem
              text="Settings"
              onClick={closeAnd(() => navigate("/settings"))}
            />
          </div>
        )}
      </div>
    </div>
  );
}