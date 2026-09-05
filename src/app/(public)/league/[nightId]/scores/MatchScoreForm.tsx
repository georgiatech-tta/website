"use client";

import { useState } from "react";
import { submitMatchScore } from "@/app/actions/matches";

interface Props {
  matchId: string;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
}

export default function MatchScoreForm({ matchId, player1, player2 }: Props) {
  const [scoreP1, setScoreP1] = useState("");
  const [scoreP2, setScoreP2] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!winnerId) { setStatus("error"); setMessage("Please select a winner."); return; }
    setStatus("loading");
    const res = await submitMatchScore(matchId, {
      scoreP1,
      scoreP2,
      winnerId,
      submitterEmail: email,
    });
    if ("error" in res) {
      setStatus("error");
      setMessage(res.error);
    } else {
      setStatus("success");
      setMessage("Score submitted! Awaiting admin review.");
    }
  }

  if (status === "success") {
    return <p className="text-green-600 text-sm">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {player1.name} score
          </label>
          <input
            type="text"
            value={scoreP1}
            onChange={(e) => setScoreP1(e.target.value)}
            placeholder="11-7,9-11"
            required
            className="border rounded px-2 py-1 text-sm w-36"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {player2.name} score
          </label>
          <input
            type="text"
            value={scoreP2}
            onChange={(e) => setScoreP2(e.target.value)}
            placeholder="7-11,11-9"
            required
            className="border rounded px-2 py-1 text-sm w-36"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Winner</label>
        <select
          value={winnerId}
          onChange={(e) => setWinnerId(e.target.value)}
          required
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Select winner</option>
          <option value={player1.id}>{player1.name}</option>
          <option value={player2.id}>{player2.name}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Your email (optional, for records)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border rounded px-2 py-1 text-sm w-56"
        />
      </div>

      {status === "error" && <p className="text-red-600 text-sm">{message}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
      >
        {status === "loading" ? "Submitting…" : "Submit Score"}
      </button>
    </form>
  );
}
