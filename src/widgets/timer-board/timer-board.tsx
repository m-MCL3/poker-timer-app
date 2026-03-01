export default function TimerBoard({
  timeText,
  showPause,
}: {
  timeText: string;
  showPause: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          textAlign: "center",
          fontWeight: 950,
          fontSize: "clamp(52px, 10vw, 92px)",
          marginTop: 10,
        }}
      >
        {timeText}
      </div>

      {showPause && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #223047",
              background: "rgba(15,23,42,0.7)",
              fontWeight: 950,
              letterSpacing: 3,
            }}
          >
            PAUSE
          </div>
        </div>
      )}
    </div>
  );
}