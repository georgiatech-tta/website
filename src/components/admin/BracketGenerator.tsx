"use client";

import { useState } from "react";
import { generateBrackets, BracketPlayer } from "@/lib/bracket";
import { useRouter } from "next/navigation";

interface Player { id: string; name: string; leagueRating: number; }

export default function BracketGeneratorClient({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupSize, setGroupSize] = useState(5);
  const [brackets, setBrackets] = useState<BracketPlayer[][]>([]);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function generate() {
    const attendees = players
      .filter((p) => selected.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, rating: p.leagueRating }));
    const groups = generateBrackets(attendees, groupSize);
    setBrackets(groups.map((g) => g.players));
  }

  // Move a player between groups via drag — simple swap by click for now
  // ponytail: no drag library; use click-to-move, add dnd-kit if needed
  function movePlayer(fromGroup: number, playerId: string, toGroup: number) {
    setBrackets((prev) => {
      const next = prev.map((g) => [...g]);
      const player = next[fromGroup].find((p) => p.id === playerId)!;
      next[fromGroup] = next[fromGroup].filter((p) => p.id !== playerId);
      next[toGroup] = [...next[toGroup], player];
      return next;
    });
  }

  function sendToLeagueEntry() {
    // Encode bracket as query params and redirect to a pre-filled league night form
    const params = new URLSearchParams();
    brackets.forEach((group, gi) => {
      group.forEach((p) => params.append(`g${gi}`, p.id));
    });
    router.push(`/admin/league/new?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Attendee selection */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search player…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Group size:</label>
            <input
              type="number"
              min={4}
              max={7}
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 5)}
              className="border rounded-lg px-3 py-2 text-sm w-16"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition ${
                selected.has(p.id)
                  ? "bg-[var(--gt-navy)] text-white border-[var(--gt-navy)]"
                  : "hover:border-gray-400"
              }`}
            >
              <span className="font-medium">{p.name}</span>
              <span className={`ml-2 font-mono text-xs ${selected.has(p.id) ? "text-white/60" : "text-gray-400"}`}>
                {p.leagueRating}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <span className="text-sm text-gray-500">{selected.size} selected</span>
          <button
            type="button"
            onClick={generate}
            disabled={selected.size < 2}
            className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
          >
            Generate Brackets
          </button>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Generated brackets */}
      {brackets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--gt-navy)] mb-3">
            {brackets.length} Groups · Click a player to move them to another group
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {brackets.map((group, gi) => (
              <div key={gi} className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-[var(--gt-navy)] mb-2">Table {gi + 1}</h3>
                <div className="space-y-1">
                  {group.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <span className="text-sm">{p.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs text-gray-400 font-mono">{p.rating}</span>
                        {brackets.length > 1 && (
                          <select
                            onChange={(e) => {
                              const target = parseInt(e.target.value);
                              if (!isNaN(target) && target !== gi) movePlayer(gi, p.id, target);
                              e.target.value = "";
                            }}
                            className="text-xs border rounded px-1"
                            defaultValue=""
                          >
                            <option value="" disabled>Move to…</option>
                            {brackets.map((_, ti) =>
                              ti !== gi ? <option key={ti} value={ti}>Table {ti + 1}</option> : null
                            )}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Avg: {Math.round(group.reduce((s, p) => s + p.rating, 0) / group.length)}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={sendToLeagueEntry}
            className="bg-[var(--gt-gold)] text-[var(--gt-navy)] font-semibold px-6 py-3 rounded-lg hover:brightness-105 transition"
          >
            Use These Groups → League Entry
          </button>
        </div>
      )}
    </div>
  );
}
