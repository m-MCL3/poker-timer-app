type FL = { sb: number; bb: number; ante: number };
type STUD = { bringIn: number; complete: number; ante: number };
type NLPL = { sb: number; bb: number; nlAnte: number };

function fmtDash(n: number): string {
  return n === 0 ? "-" : String(n);
}

/**
 * 3カラム固定 + 値は独立表示（結合禁止）
 * 外枠（行全体の枠）は無し。中のパネルは維持。
 */
function BlindRowGrid(props: {
  leftTitle: string;
  labels: [string, string, string];
  big: { a: string; b: string; c: string };
  wrapThirdWithParen?: boolean;
}) {
  const { leftTitle, labels, big, wrapThirdWithParen } = props;
  const cText = wrapThirdWithParen ? `(${big.c})` : big.c;

  return (
    <div
      style={{
        border: "none",
        borderRadius: 0,
        padding: 0,
        background: "transparent",
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "clamp(18px, 4.2vw, 24px)",
          fontWeight: 900,
          textAlign: "center",
          opacity: 0.95,
          userSelect: "none",
        }}
      >
        {leftTitle}
      </div>

      <div
        style={{
          background: "#111827",
          border: "1px solid #223047",
          borderRadius: 12,
          padding: "8px 10px",
        }}
      >
        {/* 上段ラベル */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            fontSize: 11,
            fontWeight: 800,
            opacity: 0.75,
            userSelect: "none",
          }}
        >
          <div style={{ textAlign: "center" }}>{labels[0]}</div>
          <div style={{ textAlign: "center" }}>{labels[1]}</div>
          <div style={{ textAlign: "center" }}>{labels[2]}</div>
        </div>

        {/* 下段 値（結合しない） */}
        <div
          style={{
            marginTop: 4,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            fontSize: "clamp(18px, 4.8vw, 34px)",
            fontWeight: 950,
            letterSpacing: 1,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          <div>
            <span style={{ opacity: 0.95 }}>{big.a}</span>
          </div>
          <div>
            <span style={{ opacity: 0.95 }}>{big.b}</span>
          </div>
          <div>
            <span style={{ opacity: 0.9 }}>{cText}</span>
          </div>
        </div>

        {/* セパレータ "/" を“別要素”で表示（結合しない） */}
        <div style={{ position: "relative", height: 0 }}>
          <div
            style={{
              position: "absolute",
              left: "33.333%",
              top: -34,
              transform: "translateX(-50%)",
              opacity: 0.55,
              fontWeight: 950,
              fontSize: "clamp(18px, 4.8vw, 34px)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            /
          </div>
          <div
            style={{
              position: "absolute",
              left: "66.666%",
              top: -34,
              transform: "translateX(-50%)",
              opacity: 0.55,
              fontWeight: 950,
              fontSize: "clamp(18px, 4.8vw, 34px)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            /
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlindsPanel(props: { fl: FL; stud: STUD; nlpl: NLPL }) {
  const { fl, stud, nlpl } = props;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontWeight: 800, userSelect: "none" }}>Brinds</div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gap: 10,
          border: "1px solid #223047",
          borderRadius: 18,
          padding: 12,
          background: "#111827",
        }}
      >
        <BlindRowGrid
          leftTitle="FL"
          labels={["SB", "BB", "Ante"]}
          big={{ a: String(fl.sb), b: String(fl.bb), c: fmtDash(fl.ante) }}
          wrapThirdWithParen
        />

        <BlindRowGrid
          leftTitle="STUD"
          labels={["Bring-in", "Complete", "Ante"]}
          big={{
            a: String(stud.bringIn),
            b: String(stud.complete),
            c: String(stud.ante),
          }}
          wrapThirdWithParen
        />

        <BlindRowGrid
          leftTitle="NL/PL"
          labels={["SB", "BB", "Ante"]}
          big={{ a: String(nlpl.sb), b: String(nlpl.bb), c: `${nlpl.nlAnte}/-` }}
          wrapThirdWithParen
        />
      </div>
    </div>
  );
}