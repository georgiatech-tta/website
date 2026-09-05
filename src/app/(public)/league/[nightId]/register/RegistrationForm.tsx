"use client";

import { registerForNight } from "@/app/actions/registration";
import { useState } from "react";

export function RegistrationForm({
  nightId,
  nightDate,
  players,
}: {
  nightId: string;
  nightDate: string;
  players: { id: string; name: string; leagueRating: number }[];
}) {
  const [mode, setMode] = useState<"roster" | "guest">("roster");
  const [playerId, setPlayerId] = useState("");
  const [search, setSearch] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    let result;
    if (mode === "roster") {
      if (!playerId) { setStatus("error"); setMessage("Select a player."); return; }
      result = await registerForNight(nightId, { playerId });
    } else {
      if (!guestName.trim()) { setStatus("error"); setMessage("Name is required."); return; }
      result = await registerForNight(nightId, {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
      });
    }
    if ("success" in result) {
      setStatus("success");
      setMessage(`You're registered for ${nightDate}!`);
      setPlayerId(""); setSearch(""); setGuestName(""); setGuestEmail("");
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("roster")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "roster" ? "bg-[var(--gt-navy)] text-white" : "border border-[var(--gt-navy)] text-[var(--gt-navy)]"}`}>
          I'm on the roster
        </button>
        <button type="button" onClick={() => setMode("guest")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "guest" ? "bg-[var(--gt-navy)] text-white" : "border border-[var(--gt-navy)] text-[var(--gt-navy)]"}`}>
          I'm a guest
        </button>
      </div>

      {mode === "roster" ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPlayerId(""); }}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
            {filtered.length === 0 && (
              <p className="p-3 text-sm text-gray-400">No players found.</p>
            )}
            {filtered.map((p) => (
              <button key={p.id} type="button"
                onClick={() => { setPlayerId(p.id); setSearch(p.name); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition flex justify-between ${playerId === p.id ? "bg-blue-50" : ""}`}>
                <span>{p.name}</span>
                <span className="text-gray-400">{p.leagueRating}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input type="text" placeholder="Your name *" required value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="email" placeholder="Email (optional)" value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      )}

      <button type="submit" disabled={status === "loading"}
        className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50">
        {status === "loading" ? "Registering..." : "Register"}
      </button>

      {status === "success" && <p className="text-green-600 text-sm">{message}</p>}
      {status === "error" && <p className="text-red-600 text-sm">{message}</p>}
    </form>
  );
}
