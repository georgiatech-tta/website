"use client";

import { useState, useTransition, useEffect } from "react";
import confetti from "canvas-confetti";
import { submitMatchScore } from "@/app/actions/matches";
import type { KioskPlayer, KioskMatch } from "./KioskShell";

interface Props {
  match: KioskMatch;
  player1: KioskPlayer | null;
  player2: KioskPlayer | null;
  onBack: () => void;
  onSuccess: (updated: Partial<KioskMatch>) => void;
}

interface Game {
  p1: number;
  p2: number;
}

function isValidGame(g: Game, index: number, total: number): boolean {
  const maxScore = Math.max(g.p1, g.p2);
  const diff = Math.abs(g.p1 - g.p2);
  const target = index >= 4 ? 7 : 11;
  return maxScore >= target && diff >= 2;
}

export default function ScoreEntryScreen({ match, player1, player2, onBack, onSuccess }: Props) {
  const [games, setGames] = useState<Game[]>([{ p1: 0, p2: 0 }]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const p1Name = player1?.name ?? "Player 1";
  const p2Name = player2?.name ?? "Player 2";

  const adjust = (gameIdx: number, side: "p1" | "p2", delta: number) => {
    setGames((prev) =>
      prev.map((g, i) =>
        i === gameIdx ? { ...g, [side]: Math.max(0, g[side] + delta) } : g
      )
    );
  };

  const setScore = (gameIdx: number, side: "p1" | "p2", val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return;
    setGames((prev) => prev.map((g, i) => (i === gameIdx ? { ...g, [side]: n } : g)));
  };

  const allValid = games.every((g, i) => isValidGame(g, i, games.length));

  const handleSubmit = () => {
    if (!winnerId) { setError("Select a winner."); return; }
    if (!allValid) { setError("All game scores must be valid (e.g. 11-7 or 11-9)."); return; }

    const scoreP1 = games.map((g) => `${g.p1}-${g.p2}`).join(",");
    const scoreP2 = games.map((g) => `${g.p2}-${g.p1}`).join(",");

    startTransition(async () => {
      const result = await submitMatchScore(match.id, {
        scoreP1,
        scoreP2,
        winnerId,
        submitterEmail: "",
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        confetti({
          colors: ["#B3A369", "#d4c37a", "#ffffff"],
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
        onSuccess({ scoreP1, scoreP2, winnerId, status: "pending_approval" });
      }
    });
  };

  if (success) {
    const winnerName = winnerId === match.player1Id ? p1Name : p2Name;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-6xl mb-4">🏆</p>
        <p className="display text-4xl mb-2" style={{ color: "var(--gt-gold)" }}>{winnerName}</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Score submitted — awaiting review</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-sm" style={{ color: "var(--text-muted)" }}>
            ← Back
          </button>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Score Entry</p>
          <div style={{ width: 60 }} />
        </div>

        {/* Winner toggle */}
        <p className="text-xs uppercase tracking-widest mb-3 text-center" style={{ color: "var(--text-muted)" }}>
          Winner
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: match.player1Id, name: p1Name, rating: player1?.leagueRating },
            { id: match.player2Id, name: p2Name, rating: player2?.leagueRating },
          ].map((p) => {
            const selected = winnerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setWinnerId(p.id)}
                className="glass p-5 text-center transition-all"
                style={{
                  boxShadow: selected ? "0 0 0 2px var(--gt-gold)" : "none",
                  background: selected ? "rgba(179,163,105,0.1)" : undefined,
                  minHeight: 80,
                }}
              >
                <p className="font-semibold text-lg" style={{ color: selected ? "var(--gt-gold)" : "var(--text-primary)" }}>
                  {p.name}
                </p>
                {p.rating != null && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{p.rating}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Game scores */}
        <p className="text-xs uppercase tracking-widest mb-3 text-center" style={{ color: "var(--text-muted)" }}>
          Games
        </p>
        <div className="space-y-3 mb-4">
          {games.map((g, idx) => (
            <div key={idx} className="glass p-4 flex items-center gap-3">
              <p className="text-xs w-12 text-center" style={{ color: "var(--text-muted)" }}>G{idx + 1}</p>
              <ScoreInput
                value={g.p1}
                label={p1Name}
                onInc={() => adjust(idx, "p1", 1)}
                onDec={() => adjust(idx, "p1", -1)}
                onChange={(v) => setScore(idx, "p1", v)}
              />
              <span style={{ color: "var(--text-muted)" }}>–</span>
              <ScoreInput
                value={g.p2}
                label={p2Name}
                onInc={() => adjust(idx, "p2", 1)}
                onDec={() => adjust(idx, "p2", -1)}
                onChange={(v) => setScore(idx, "p2", v)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setGames((prev) => [...prev, { p1: 0, p2: 0 }])}
          className="w-full mb-6 py-2 text-sm"
          style={{ color: "var(--text-muted)", border: "1px dashed var(--glass-border)", borderRadius: "var(--r-sm)" }}
        >
          + Add game
        </button>

        {error && (
          <div className="glass-sm px-4 py-3 mb-4 text-sm" style={{ color: "#f87171", borderLeft: "3px solid #f87171" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={pending}
          className="btn-gold w-full justify-center"
          style={pending ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border-2"
                style={{ borderColor: "var(--gt-navy)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }}
              />
              Submitting…
            </span>
          ) : (
            "Submit Score"
          )}
        </button>
      </div>
    </div>
  );
}

function ScoreInput({
  value,
  label,
  onInc,
  onDec,
  onChange,
}: {
  value: number;
  label: string;
  onInc: () => void;
  onDec: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-1">
      <button
        onClick={onDec}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", minWidth: 40 }}
        aria-label={`Decrease ${label} score`}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-center font-mono text-xl py-2 rounded-lg focus:outline-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-primary)",
          minWidth: 0,
        }}
      />
      <button
        onClick={onInc}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", minWidth: 40 }}
        aria-label={`Increase ${label} score`}
      >
        +
      </button>
    </div>
  );
}
