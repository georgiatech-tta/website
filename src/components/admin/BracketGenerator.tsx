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
    const params = new URLSearchParams();
    brackets.forEach((group, gi) => {
      group.forEach((p) => params.append(`g${gi}`, p.id));
    });
    router.push(`/admin/league/new?${params.toString()}`);
  }

  const inputClass = "border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-1 focus:ring-[var(--gt-gold)]";

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search player…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} flex-1`}
            style={{ color: "var(--text-primary)" }}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: "var(--text-secondary)" }}>Group size:</label>
            <input
              type="number"
              min={4}
              max={7}
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 5)}
              className={`${inputClass} w-16`}
              style={{ color: "var(--text-primary)" }}
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
                  ? "bg-[var(--gt-gold)] text-[var(--gt-navy)] border-[var(--gt-gold)]"
                  : "border-[var(--glass-border)] hover:border-[var(--gt-gold)]"
              }`}
            >
              <span className="font-medium" style={selected.has(p.id) ? {} : { color: "var(--text-primary)" }}>{p.name}</span>
              <span className={`ml-2 font-mono text-xs ${selected.has(p.id) ? "opacity-60" : ""}`}
                style={selected.has(p.id) ? {} : { color: "var(--text-muted)" }}>
                {p.leagueRating}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{selected.size} selected</span>
          <button
            type="button"
            onClick={generate}
            disabled={selected.size < 2}
            className="btn-gold disabled:opacity-50"
          >
            Generate Brackets
          </button>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm hover:text-red-400 transition"
              style={{ color: "var(--text-muted)" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {brackets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {brackets.length} Groups · Click a player to move them to another group
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {brackets.map((group, gi) => (
              <div key={gi} className="glass rounded-xl p-4">
                <h3 className="font-semibold mb-2" style={{ color: "var(--gt-gold)" }}>Table {gi + 1}</h3>
                <div className="space-y-1">
                  {group.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.rating}</span>
                        {brackets.length > 1 && (
                          <select
                            onChange={(e) => {
                              const target = parseInt(e.target.value);
                              if (!isNaN(target) && target !== gi) movePlayer(gi, p.id, target);
                              e.target.value = "";
                            }}
                            className="text-xs border border-[var(--glass-border)] rounded px-1 bg-[rgba(255,255,255,0.05)]"
                            style={{ color: "var(--text-primary)" }}
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
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
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
