"use client";

import { useState, useTransition } from "react";
import { submitLeagueNight } from "@/app/actions/league";

interface Player { id: string; name: string; leagueRating: number; }
interface Season { id: string; name: string; }

interface GroupEntry {
  playerId: string;
  ratingBefore: number;
}

interface MatchRow {
  player1Id: string;
  player2Id: string;
  scoreP1: string;
  scoreP2: string;
  winnerId: string;
}

interface GroupData {
  entries: GroupEntry[];
  matches: MatchRow[];
}

export default function LeagueEntryForm({ players, seasons }: { players: Player[]; seasons: Season[] }) {
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [groups, setGroups] = useState<GroupData[]>([{ entries: [], matches: [] }]);
  const [query, setQuery] = useState<string[]>([""]);
  const [preview, setPreview] = useState<Record<string, number> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const playerMap = new Map(players.map((p) => [p.id, p]));

  function addGroup() {
    setGroups((g) => [...g, { entries: [], matches: [] }]);
    setQuery((q) => [...q, ""]);
  }

  function addPlayerToGroup(gi: number, playerId: string) {
    const player = playerMap.get(playerId);
    if (!player) return;
    setGroups((prev) => {
      const next = prev.map((g, i) => {
        if (i !== gi) return g;
        if (g.entries.some((e) => e.playerId === playerId)) return g;
        return { ...g, entries: [...g.entries, { playerId, ratingBefore: player.leagueRating }] };
      });
      return next;
    });
    setQuery((q) => q.map((v, i) => (i === gi ? "" : v)));
  }

  function removePlayerFromGroup(gi: number, playerId: string) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i !== gi ? g : { ...g, entries: g.entries.filter((e) => e.playerId !== playerId) }
      )
    );
  }

  function updateMatch(gi: number, mi: number, field: keyof MatchRow, value: string) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const matches = g.matches.map((m, j) => (j !== mi ? m : { ...m, [field]: value }));
        return { ...g, matches };
      })
    );
  }

  function addMatch(gi: number) {
    const g = groups[gi];
    if (g.entries.length < 2) return;
    const [p1, p2] = g.entries;
    setGroups((prev) =>
      prev.map((grp, i) =>
        i !== gi
          ? grp
          : {
              ...grp,
              matches: [
                ...grp.matches,
                { player1Id: p1.playerId, player2Id: p2.playerId, scoreP1: "", scoreP2: "", winnerId: "" },
              ],
            }
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await submitLeagueNight({ seasonId, date, groups });
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.href = `/admin/league/${result.id}`;
      }
    });
  }

  const filteredPlayers = (gi: number) =>
    players.filter(
      (p) =>
        p.name.toLowerCase().includes(query[gi]?.toLowerCase() ?? "") &&
        !groups[gi].entries.some((e) => e.playerId === p.id)
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Night metadata */}
      <div className="bg-white rounded-xl border p-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-40">
          <label className="text-sm font-medium text-gray-700 block mb-1">Season</label>
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            required
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            {seasons.length === 0 && <option value="">— create a season first —</option>}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      {/* Groups */}
      {groups.map((group, gi) => (
        <div key={gi} className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-[var(--gt-navy)] mb-3">Table {gi + 1}</h3>

          {/* Player search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search player name…"
              value={query[gi] ?? ""}
              onChange={(e) => setQuery((q) => q.map((v, i) => (i === gi ? e.target.value : v)))}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            {query[gi] && (
              <div className="border rounded-lg mt-1 bg-white shadow-sm max-h-40 overflow-auto divide-y">
                {filteredPlayers(gi).slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addPlayerToGroup(gi, p.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between"
                  >
                    <span>{p.name}</span>
                    <span className="text-gray-400 font-mono">{p.leagueRating}</span>
                  </button>
                ))}
                {filteredPlayers(gi).length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">No match — add new player in Roster first.</p>
                )}
              </div>
            )}
          </div>

          {/* Players in group */}
          {group.entries.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {group.entries.map((e) => (
                <div key={e.playerId} className="flex items-center gap-1 bg-[var(--gt-light)] rounded-full px-3 py-1 text-sm">
                  <span className="font-medium">{playerMap.get(e.playerId)?.name}</span>
                  <span className="text-gray-400 font-mono ml-1">{e.ratingBefore}</span>
                  <button
                    type="button"
                    onClick={() => removePlayerFromGroup(gi, e.playerId)}
                    className="ml-1 text-gray-400 hover:text-red-500 leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Match entry */}
          <div className="space-y-2 mb-3">
            {group.matches.map((m, mi) => (
              <div key={mi} className="flex flex-wrap gap-2 items-center text-sm">
                <select
                  value={m.player1Id}
                  onChange={(e) => updateMatch(gi, mi, "player1Id", e.target.value)}
                  className="border rounded px-2 py-1 flex-1 min-w-24"
                >
                  {group.entries.map((e) => (
                    <option key={e.playerId} value={e.playerId}>{playerMap.get(e.playerId)?.name}</option>
                  ))}
                </select>
                <input
                  value={m.scoreP1}
                  onChange={(e) => updateMatch(gi, mi, "scoreP1", e.target.value)}
                  placeholder="e.g. 11-7,9-11,11-8"
                  className="border rounded px-2 py-1 w-36"
                />
                <span className="text-gray-400">vs</span>
                <input
                  value={m.scoreP2}
                  onChange={(e) => updateMatch(gi, mi, "scoreP2", e.target.value)}
                  placeholder="scores"
                  className="border rounded px-2 py-1 w-36"
                />
                <select
                  value={m.player2Id}
                  onChange={(e) => updateMatch(gi, mi, "player2Id", e.target.value)}
                  className="border rounded px-2 py-1 flex-1 min-w-24"
                >
                  {group.entries.map((e) => (
                    <option key={e.playerId} value={e.playerId}>{playerMap.get(e.playerId)?.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-xs">Winner:</span>
                  <select
                    value={m.winnerId}
                    onChange={(e) => updateMatch(gi, mi, "winnerId", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">—</option>
                    {[m.player1Id, m.player2Id].map((pid) => (
                      <option key={pid} value={pid}>{playerMap.get(pid)?.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addMatch(gi)} className="text-sm text-blue-600 hover:underline">
            + Add Match
          </button>
        </div>
      ))}

      <button type="button" onClick={addGroup} className="text-sm border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:bg-gray-50 transition">
        + Add Table/Group
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending || !seasonId}
        className="bg-[var(--gt-navy)] text-white px-6 py-3 rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save League Night & Update Ratings"}
      </button>
    </form>
  );
}
