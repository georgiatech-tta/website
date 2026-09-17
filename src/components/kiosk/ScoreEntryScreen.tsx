"use client";

import { useState, useTransition } from "react";
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

interface Game { p1: string; p2: string }

function detectWinner(games: Game[]): "p1" | "p2" | null {
  let p1Wins = 0, p2Wins = 0;
  for (const g of games) {
    const a = parseInt(g.p1) || 0;
    const b = parseInt(g.p2) || 0;
    if (a > b) p1Wins++;
    else if (b > a) p2Wins++;
  }
  if (p1Wins >= 2) return "p1";
  if (p2Wins >= 2) return "p2";
  return null;
}

export default function ScoreEntryScreen({ match, player1, player2, onBack, onSuccess }: Props) {
  const [games, setGames] = useState<Game[]>([{ p1: "", p2: "" }, { p1: "", p2: "" }, { p1: "", p2: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const p1Name = player1?.name ?? "Player 1";
  const p2Name = player2?.name ?? "Player 2";
  const winner = detectWinner(games);

  const updateGame = (idx: number, side: "p1" | "p2", val: string) => {
    const next = [...games];
    next[idx] = { ...next[idx], [side]: val.replace(/\D/g, "").slice(0, 3) };
    setGames(next);
  };

  const addGame = () => {
    if (games.length < 7) setGames([...games, { p1: "", p2: "" }]);
  };

  const removeGame = (idx: number) => {
    if (games.length > 2) setGames(games.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!winner) { setError("Winner not yet determined — enter all game scores."); return; }
    const filled = games.filter((g) => g.p1 !== "" || g.p2 !== "");
    const scoreP1 = filled.map((g) => `${parseInt(g.p1) || 0}-${parseInt(g.p2) || 0}`).join(",");
    const scoreP2 = filled.map((g) => `${parseInt(g.p2) || 0}-${parseInt(g.p1) || 0}`).join(",");
    const winnerId = winner === "p1" ? match.player1Id : match.player2Id;
    setError(null);
    startTransition(async () => {
      const result = await submitMatchScore(match.id, { scoreP1, scoreP2, winnerId, submitterEmail: "" });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        confetti({ colors: ["#B3A369", "#d4c37a", "#ffffff"], particleCount: 100, spread: 80, origin: { y: 0.5 } });
        onSuccess({ scoreP1, scoreP2, winnerId, status: "pending_approval" });
      }
    });
  };

  if (success) {
    const winnerName = winner === "p1" ? p1Name : p2Name;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-6xl mb-4">🏆</p>
        <p className="display text-4xl mb-2" style={{ color: "var(--gt-gold)" }}>{winnerName}</p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Score submitted — awaiting review</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-sm" style={{ color: "var(--gt-gold)" }}>← Back</button>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Score Entry</p>
          <div style={{ width: 60 }} />
        </div>

        {/* Player column headers */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 mb-3">
          <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{p1Name}</span>
          <span className="w-6" />
          <span className="text-sm font-semibold truncate text-right" style={{ color: "var(--text-primary)" }}>{p2Name}</span>
          <span className="w-5" />
        </div>

        {/* Game rows */}
        <div className="space-y-2 mb-4">
          {games.map((g, idx) => {
            const a = parseInt(g.p1) || 0;
            const b = parseInt(g.p2) || 0;
            const p1Won = g.p1 !== "" && g.p2 !== "" && a > b;
            const p2Won = g.p1 !== "" && g.p2 !== "" && b > a;
            return (
              <div key={idx} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={g.p1}
                  onChange={(e) => updateGame(idx, "p1", e.target.value)}
                  placeholder="0"
                  className="text-center text-xl font-semibold rounded-lg py-3 px-1 w-full focus:outline-none"
                  style={{
                    background: p1Won ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.08)",
                    border: p1Won ? "1px solid rgba(74,222,128,0.4)" : "1px solid var(--glass-border)",
                    color: p1Won ? "#4ade80" : "var(--text-primary)",
                  }}
                />
                <span className="text-center text-sm w-6" style={{ color: "var(--text-secondary)" }}>—</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={g.p2}
                  onChange={(e) => updateGame(idx, "p2", e.target.value)}
                  placeholder="0"
                  className="text-center text-xl font-semibold rounded-lg py-3 px-1 w-full focus:outline-none"
                  style={{
                    background: p2Won ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.08)",
                    border: p2Won ? "1px solid rgba(74,222,128,0.4)" : "1px solid var(--glass-border)",
                    color: p2Won ? "#4ade80" : "var(--text-primary)",
                  }}
                />
                {games.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeGame(idx)}
                    className="text-lg leading-none w-5"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label="Remove game"
                  >×</button>
                ) : <span className="w-5" />}
              </div>
            );
          })}
        </div>

        {/* Winner indicator */}
        {winner && (
          <div
            className="text-center text-sm font-semibold py-3 rounded-lg mb-4"
            style={{ background: "rgba(179,163,105,0.15)", color: "var(--gt-gold)", border: "1px solid rgba(179,163,105,0.3)" }}
          >
            {winner === "p1" ? p1Name : p2Name} wins
          </div>
        )}

        {!winner && games.length < 7 && (
          <button
            onClick={addGame}
            className="w-full mb-4 py-2 text-sm"
            style={{ color: "var(--text-secondary)", border: "1px dashed var(--glass-border)", borderRadius: "var(--r-sm)" }}
          >
            + Add game
          </button>
        )}

        {error && (
          <div className="glass-sm px-4 py-3 mb-4 text-sm" style={{ color: "#f87171", borderLeft: "3px solid #f87171" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={pending || !winner}
          className="btn-gold w-full justify-center"
          style={!winner || pending ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border-2"
                style={{ borderColor: "var(--gt-navy)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }}
              />
              Submitting…
            </span>
          ) : "Submit Score"}
        </button>
      </div>
    </div>
  );
}
