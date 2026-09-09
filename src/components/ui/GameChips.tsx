interface GameChipsProps {
  scoreP1: string;
  scoreP2: string;
  winnerId: string | null;
  player1Id: string;
}

export default function GameChips({ scoreP1, scoreP2, winnerId, player1Id }: GameChipsProps) {
  if (!scoreP1 || !scoreP2) return null;

  const p1Scores = scoreP1.split(",").map(Number);
  const p2Scores = scoreP2.split(",").map(Number);
  const p1IsWinner = winnerId === player1Id;

  return (
    <div className="flex flex-wrap gap-1">
      {p1Scores.map((s1, i) => {
        const s2 = p2Scores[i] ?? 0;
        const p1WonGame = s1 > s2;
        return (
          <span
            key={i}
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)" }}
          >
            <span style={{ color: p1WonGame ? "var(--gt-gold)" : "var(--text-muted)", fontWeight: p1WonGame ? 700 : 400 }}>{s1}</span>
            <span style={{ color: "var(--text-muted)" }}>–</span>
            <span style={{ color: !p1WonGame ? "var(--gt-gold)" : "var(--text-muted)", fontWeight: !p1WonGame ? 700 : 400 }}>{s2}</span>
          </span>
        );
      })}
      {/* overall winner indicator */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{
          background: "rgba(179,163,105,0.15)",
          color: "var(--gt-gold)",
          border: "1px solid rgba(179,163,105,0.3)",
        }}
      >
        {p1IsWinner ? "P1 wins" : "P2 wins"}
      </span>
    </div>
  );
}
