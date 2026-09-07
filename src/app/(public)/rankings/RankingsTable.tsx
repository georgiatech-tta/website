"use client";

import { useState } from "react";

interface Player {
  id: string;
  name: string;
  leagueRating: number;
  usattRating: number | null;
}

const medals: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export default function RankingsTable({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"leagueRating" | "usattRating">("leagueRating");

  const filtered = [...players]
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => ((b[sortKey] ?? 0) as number) - ((a[sortKey] ?? 0) as number));

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 px-1">
        <input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          className="px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="leagueRating">League Rating</option>
          <option value="usattRating">USATT Rating</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 pb-4 text-sm" style={{ color: "var(--text-muted)" }}>No players match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <th className="px-4 py-3 text-left w-14 text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Rank</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Name</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>League</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>USATT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid rgba(179,163,105,0.08)",
                    background: i < 3 ? "rgba(179,163,105,0.05)" : "transparent",
                  }}
                >
                  <td className="px-4 py-3 text-center">
                    {medals[i] !== undefined ? (
                      <span className="text-base">{medals[i]}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: i < 3 ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                    {p.leagueRating}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--text-muted)" }}>
                    {p.usattRating ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
