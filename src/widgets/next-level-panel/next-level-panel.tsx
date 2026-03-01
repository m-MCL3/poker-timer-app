export default function NextLevelPanel({ next }: any) {
  if (!next) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <div>Next level</div>
      <div>
        FL {next.fl}
        <br />
        STUD {next.stud}
        <br />
        NL/PL {next.nlpl}
      </div>
    </div>
  );
}