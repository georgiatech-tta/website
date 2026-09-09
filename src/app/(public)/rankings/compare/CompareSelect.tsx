"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  leagueRating: number;
}

export default function CompareSelect({ players, preselect }: { players: Player[]; preselect?: string }) {
  const router = useRouter();
  const [playerA, setPlayerA] = useState<Player | null>(players.find((p) => p.id === preselect) ?? null);
  const [playerB, setPlayerB] = useState<Player | null>(null);
  const [queryA, setQueryA] = useState(playerA?.name ?? "");
  const [queryB, setQueryB] = useState("");

  const filteredA = players.filter((p) => p.name.toLowerCase().includes(queryA.toLowerCase()) && p.id !== playerB?.id);
  const filteredB = players.filter((p) => p.name.toLowerCase().includes(queryB.toLowerCase()) && p.id !== playerA?.id);

  const canCompare = playerA && playerB;

  return (
    <div className="max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <PlayerPicker
          label="Player A"
          query={queryA}
          setQuery={setQueryA}
          filtered={filteredA}
          selected={playerA}
          onSelect={(p) => { setPlayerA(p); setQueryA(p.name); }}
        />
        <PlayerPicker
          label="Player B"
          query={queryB}
          setQuery={setQueryB}
          filtered={filteredB}
          selected={playerB}
          onSelect={(p) => { setPlayerB(p); setQueryB(p.name); }}
        />
      </div>

      <button
        disabled={!canCompare}
        onClick={() => canCompare && router.push(`/rankings/compare?a=${playerA.id}&b=${playerB.id}`)}
        className="btn-gold w-full justify-center"
        style={!canCompare ? { opacity: 0.4, cursor: "not-allowed" } : {}}
      >
        Compare →
      </button>
    </div>
  );
}

function PlayerPicker({
  label,
  query,
  setQuery,
  filtered,
  selected,
  onSelect,
}: {
  label: string;
  query: string;
  setQuery: (q: string) => void;
  filtered: { id: string; name: string; leagueRating: number }[];
  selected: { id: string; name: string } | null;
  onSelect: (p: { id: string; name: string; leagueRating: number }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gt-gold)" }}>{label}</p>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search player…"
        className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1"
        style={{
          background: selected ? "rgba(179,163,105,0.1)" : "rgba(255,255,255,0.08)",
          border: selected ? "1px solid var(--gt-gold)" : "1px solid var(--glass-border)",
          color: "var(--text-primary)",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          className="glass-sm absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto z-20"
          style={{ boxShadow: "var(--glass-shadow)" }}
        >
          {filtered.slice(0, 8).map((p) => (
            <button
              key={p.id}
              onMouseDown={() => onSelect(p)}
              className="w-full text-left px-3 py-2 text-sm flex justify-between items-center hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{p.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.leagueRating}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
