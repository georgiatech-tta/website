"use client";

import { useState, useEffect, useTransition } from "react";
import { submitMatchScore } from "@/app/actions/matches";
import GameChips from "@/components/ui/GameChips";
import confetti from "canvas-confetti";

interface Props {
  matchId: string;
  player1: { id: string; name: string; rating?: number };
  player2: { id: string; name: string; rating?: number };
}

export default function MatchScoreForm({ matchId, player1, player2 }: Props) {
  const [scoreP1, setScoreP1] = useState("");
  const [scoreP2, setScoreP2] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (success) {
      confetti({ colors: ["#B3A369", "#d4c37a", "#ffffff"], particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  }, [success]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerId) { setErrorMsg("Select a winner."); return; }
    setErrorMsg("");
    startTransition(async () => {
      const res = await submitMatchScore(matchId, { scoreP1, scoreP2, winnerId, submitterEmail: email });
      if ("error" in res) {
        setErrorMsg(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  const winnerName = winnerId === player1.id ? player1.name : winnerId === player2.id ? player2.name : null;

  if (success) {
    return (
      <div className="glass p-8 text-center flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "rgba(179,163,105,0.15)", border: "1px solid rgba(179,163,105,0.3)" }}
        >
          🏆
        </div>
        {winnerName && (
          <p className="display text-2xl" style={{ color: "var(--gt-gold)" }}>{winnerName} wins!</p>
        )}
        {scoreP1 && scoreP2 && (
          <GameChips scoreP1={scoreP1} scoreP2={scoreP2} winnerId={winnerId} player1Id={player1.id} />
        )}
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Score submitted — awaiting admin review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Score inputs */}
      <div className="grid grid-cols-2 gap-3">
        {[{ player: player1, val: scoreP1, set: setScoreP1 }, { player: player2, val: scoreP2, set: setScoreP2 }].map(({ player, val, set }) => (
          <div key={player.id} className="glass-sm p-3">
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              {player.name}
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder="11-7,9-11,11-9"
              required
              className="w-full bg-transparent text-sm font-mono px-0 py-1 focus:outline-none border-b"
              style={{ borderColor: "var(--glass-border)", color: "var(--text-primary)" }}
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>Games as score1-score2, comma separated</p>
          </div>
        ))}
      </div>

      {/* Winner toggle */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Winner</p>
        <div className="grid grid-cols-2 gap-3">
          {[player1, player2].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setWinnerId(p.id)}
              className="glass p-4 text-left transition-all"
              style={{
                borderColor: winnerId === p.id ? "var(--gt-gold)" : "var(--glass-border)",
                background: winnerId === p.id ? "rgba(179,163,105,0.08)" : "var(--glass-bg)",
              }}
            >
              <p className="font-semibold" style={{ color: winnerId === p.id ? "var(--gt-gold)" : "var(--text-primary)" }}>
                {p.name}
              </p>
              {p.rating != null && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Rating: {p.rating}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Your email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gatech.edu"
          className="glass-sm w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {errorMsg && (
        <div className="glass-sm px-4 py-3 flex items-center gap-2 text-sm" style={{ borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
          <span>!</span> {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-gold w-full justify-center"
      >
        {pending ? (
          <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gt-navy)", borderTopColor: "transparent" }} />
        ) : "Submit Score"}
      </button>
    </form>
  );
}
