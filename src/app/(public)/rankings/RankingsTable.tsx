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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--gt-gold)]"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gt-gold)]"
        >
          <option value="leagueRating">League Rating</option>
          <option value="usattRating">USATT Rating</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No players match your search.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-[var(--gt-navy)] text-white text-left">
              <tr>
                <th className="px-4 py-3 w-14">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">League Rating</th>
                <th className="px-4 py-3 text-right">USATT Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={[
                    i % 2 === 0 ? "bg-white" : "bg-[var(--gt-light)]",
                    i < 3 ? "font-semibold" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 text-center">
                    {medals[i] !== undefined ? (
                      <span className="text-base">{medals[i]}</span>
                    ) : (
                      <span className="text-gray-500">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--gt-navy)]">{p.name}</td>
                  <td className="px-4 py-3 text-right">{p.leagueRating}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{p.usattRating ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
