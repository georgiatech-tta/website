"use client";

import { useState, useTransition, useEffect } from "react";
import { submitMatchScore } from "@/app/actions/matches";
import confetti from "canvas-confetti";

interface Props {
  matchId: string;
  me: { id: string; name: string };
  them: { id: string; name: string };
  iAmPlayer1: boolean;
}

interface Game {
  me: string;
  them: string;
}

function detectWinner(games: Game[]): "me" | "them" | null {
  let myWins = 0;
  let theirWins = 0;
  for (const g of games) {
    const me = parseInt(g.me) || 0;
    const them = parseInt(g.them) || 0;
    if (me > them) myWins++;
    else if (them > me) theirWins++;
  }
  if (myWins >= 2) return "me";
  if (theirWins >= 2) return "them";
  return null;
}

export default function MatchScoreForm({ matchId, me, them, iAmPlayer1 }: Props) {
  const [games, setGames] = useState<Game[]>([
    { me: "", them: "" },
    { me: "", them: "" },
    { me: "", them: "" },
  ]);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const winner = detectWinner(games);

  useEffect(() => {
    if (success) {
      confetti({ colors: ["#B3A369", "#d4c37a", "#ffffff"], particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  }, [success]);

  const updateGame = (idx: number, side: "me" | "them", val: string) => {
    const next = [...games];
    next[idx] = { ...next[idx], [side]: val.replace(/\D/g, "").slice(0, 3) };
    setGames(next);
  };

  const addGame = () => {
    if (games.length < 7) setGames([...games, { me: "", them: "" }]);
  };

  const removeGame = (idx: number) => {
    if (games.length > 2) setGames(games.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner) { setErrorMsg("Winner not yet determined — enter all game scores."); return; }

    // Build scoreP1/scoreP2 from perspective of match.player1Id
    const filledGames = games.filter((g) => g.me !== "" || g.them !== "");
    const scores = filledGames.map((g) => {
      const me = parseInt(g.me) || 0;
      const them = parseInt(g.them) || 0;
      return iAmPlayer1 ? `${me}-${them}` : `${them}-${me}`;
    });
    const scoreP1 = iAmPlayer1
      ? filledGames.map((g) => `${parseInt(g.me) || 0}-${parseInt(g.them) || 0}`).join(",")
      : filledGames.map((g) => `${parseInt(g.them) || 0}-${parseInt(g.me) || 0}`).join(",");
    const scoreP2 = iAmPlayer1
      ? filledGames.map((g) => `${parseInt(g.them) || 0}-${parseInt(g.me) || 0}`).join(",")
      : filledGames.map((g) => `${parseInt(g.me) || 0}-${parseInt(g.them) || 0}`).join(",");

    const winnerId = winner === "me" ? me.id : them.id;

    setErrorMsg("");
    startTransition(async () => {
      const res = await submitMatchScore(matchId, { scoreP1, scoreP2, winnerId, submitterEmail: "" });
      if ("error" in res) setErrorMsg(res.error);
      else setSuccess(true);
    });
  };

  if (success) {
    return (
      <div className="text-center py-4 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">🏆</div>
        <p className="font-semibold text-gray-900">{winner === "me" ? me.name : them.name} wins!</p>
        <p className="text-sm text-gray-500">Score submitted — awaiting review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide truncate">{me.name}</span>
        <span className="text-xs text-gray-400 text-center w-6"></span>
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide truncate text-right">{them.name}</span>
      </div>

      {/* Game rows */}
      <div className="space-y-2">
        {games.map((g, idx) => {
          const myScore = parseInt(g.me) || 0;
          const theirScore = parseInt(g.them) || 0;
          const myWon = g.me !== "" && g.them !== "" && myScore > theirScore;
          const theyWon = g.me !== "" && g.them !== "" && theirScore > myScore;

          return (
            <div key={idx} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={g.me}
                onChange={(e) => updateGame(idx, "me", e.target.value)}
                placeholder="0"
                className={`text-center text-lg font-semibold rounded-lg border py-2 px-1 w-full focus:outline-none focus:ring-2 focus:ring-[#B3A369] transition-colors ${
                  myWon ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50 text-gray-900"
                }`}
              />
              <span className="text-gray-400 text-sm font-light text-center">—</span>
              <input
                type="text"
                inputMode="numeric"
                value={g.them}
                onChange={(e) => updateGame(idx, "them", e.target.value)}
                placeholder="0"
                className={`text-center text-lg font-semibold rounded-lg border py-2 px-1 w-full focus:outline-none focus:ring-2 focus:ring-[#B3A369] transition-colors ${
                  theyWon ? "border-red-300 bg-red-50 text-red-800" : "border-gray-200 bg-gray-50 text-gray-900"
                }`}
              />
              {games.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeGame(idx)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none w-5"
                  aria-label="Remove game"
                >
                  ×
                </button>
              ) : (
                <span className="w-5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Winner indicator */}
      {winner && (
        <div className={`text-center text-sm font-semibold py-2 rounded-lg ${
          winner === "me" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {winner === "me" ? `${me.name} wins` : `${them.name} wins`}
        </div>
      )}

      {games.length < 7 && !winner && (
        <button
          type="button"
          onClick={addGame}
          className="text-sm text-[#B3A369] hover:underline"
        >
          + Add game
        </button>
      )}

      {errorMsg && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={pending || !winner}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: winner ? "#B3A369" : "#e5e7eb", color: winner ? "#1a1a1a" : "#9ca3af" }}
      >
        {pending ? "Submitting…" : "Submit Score"}
      </button>
    </form>
  );
}
