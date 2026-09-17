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

  const inputClass = "w-full border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-1 focus:ring-[var(--gt-gold)]";

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("roster")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "roster"
              ? "bg-[var(--gt-gold)] text-[var(--gt-navy)]"
              : "btn-glass"
          }`}>
          I&apos;m on the roster
        </button>
        <button type="button" onClick={() => setMode("guest")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "guest"
              ? "bg-[var(--gt-gold)] text-[var(--gt-navy)]"
              : "btn-glass"
          }`}>
          I&apos;m a guest
        </button>
      </div>

      {mode === "roster" ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPlayerId(""); }}
            className={inputClass}
            style={{ color: "var(--text-primary)" }}
          />
          <div className="border border-[var(--glass-border)] rounded-lg max-h-48 overflow-y-auto divide-y divide-[var(--glass-border)]">
            {filtered.length === 0 && (
              <p className="p-3 text-sm" style={{ color: "var(--text-muted)" }}>No players found.</p>
            )}
            {filtered.map((p) => (
              <button key={p.id} type="button"
                onClick={() => { setPlayerId(p.id); setSearch(p.name); }}
                className="w-full text-left px-3 py-2 text-sm transition flex justify-between"
                style={{
                  color: "var(--text-primary)",
                  background: playerId === p.id ? "rgba(179,163,105,0.15)" : "transparent",
                }}
                onMouseEnter={(e) => { if (playerId !== p.id) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = playerId === p.id ? "rgba(179,163,105,0.15)" : "transparent"; }}
              >
                <span>{p.name}</span>
                <span style={{ color: "var(--text-muted)" }} className="font-mono">{p.leagueRating}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input type="text" placeholder="Your name *" required value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className={inputClass}
            style={{ color: "var(--text-primary)" }} />
          <input type="email" placeholder="Email (optional)" value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className={inputClass}
            style={{ color: "var(--text-primary)" }} />
        </div>
      )}

      <button type="submit" disabled={status === "loading"}
        className="btn-gold disabled:opacity-50">
        {status === "loading" ? "Registering..." : "Register"}
      </button>

      {status === "success" && <p className="text-green-400 text-sm">{message}</p>}
      {status === "error" && <p className="text-red-400 text-sm">{message}</p>}
    </form>
  );
}
