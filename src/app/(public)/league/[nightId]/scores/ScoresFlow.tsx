"use client";

import { useState } from "react";
import MatchScoreForm from "./MatchScoreForm";

interface Player {
  id: string;
  name: string;
}

interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  status: string;
  scoreP1: string | null;
  scoreP2: string | null;
  winnerId: string | null;
  rejectionReason: string | null;
}

interface Group {
  id: string;
  tableNumber: number | null;
  players: Player[];
  matches: Match[];
}

interface Props {
  groups: Group[];
}

export default function ScoresFlow({ groups }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Step 1: group picker
  if (!selectedGroup) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Which group are you in?</p>
        <div className="grid grid-cols-2 gap-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#B3A369] hover:bg-amber-50 transition-colors"
            >
              <p className="font-semibold text-gray-900 mb-1">Group {g.tableNumber}</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {g.players.map((p) => p.name).join(" · ")}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: player picker
  if (!selectedPlayer) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setSelectedGroup(null)}
          className="text-sm text-[#B3A369] hover:underline flex items-center gap-1"
        >
          ← Group {selectedGroup.tableNumber}
        </button>
        <p className="text-sm font-medium text-gray-700">Which player are you?</p>
        <div className="flex flex-col gap-2">
          {selectedGroup.players.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className="text-left bg-white border border-gray-200 rounded-xl px-5 py-3 hover:border-[#B3A369] hover:bg-amber-50 transition-colors font-medium text-gray-900"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: score entry — show only this player's matches
  const myMatches = selectedGroup.matches.filter(
    (m) => m.player1Id === selectedPlayer.id || m.player2Id === selectedPlayer.id
  );

  const opponentName = (m: Match) => {
    const oppId = m.player1Id === selectedPlayer.id ? m.player2Id : m.player1Id;
    return selectedGroup.players.find((p) => p.id === oppId)?.name ?? "Unknown";
  };

  // Ensure selected player is always "player left" (me)
  const normalizeMatch = (m: Match) => {
    const iAmP1 = m.player1Id === selectedPlayer.id;
    return {
      ...m,
      meId: selectedPlayer.id,
      themId: iAmP1 ? m.player2Id : m.player1Id,
      // If I'm player2, flip scores for display purposes
      myScore: iAmP1 ? m.scoreP1 : m.scoreP2,
      theirScore: iAmP1 ? m.scoreP2 : m.scoreP1,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedPlayer(null)}
          className="text-sm text-[#B3A369] hover:underline"
        >
          ← Back
        </button>
        <div>
          <span className="font-semibold text-gray-900">{selectedPlayer.name}</span>
          <span className="text-gray-500 text-sm ml-2">· Group {selectedGroup.tableNumber}</span>
        </div>
      </div>

      {myMatches.length === 0 && (
        <p className="text-gray-500 text-sm">No matches found for this player.</p>
      )}

      <div className="space-y-4">
        {myMatches.map((match) => {
          const nm = normalizeMatch(match);
          const opp = opponentName(match);

          if (match.status === "approved") {
            return (
              <div key={match.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {selectedPlayer.name} vs {opp}
                </p>
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <span>✓ Approved —</span>
                  <span>{match.winnerId === selectedPlayer.id ? selectedPlayer.name : opp} wins</span>
                </p>
              </div>
            );
          }

          if (match.status === "pending_approval") {
            return (
              <div key={match.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {selectedPlayer.name} vs {opp}
                </p>
                <p className="text-amber-600 text-sm">⏳ Submitted — awaiting review</p>
              </div>
            );
          }

          return (
            <div key={match.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">
                {selectedPlayer.name} vs {opp}
              </p>
              {match.status === "rejected" && match.rejectionReason && (
                <p className="text-red-600 text-sm mb-3">Rejected: {match.rejectionReason}</p>
              )}
              <MatchScoreForm
                matchId={match.id}
                me={{ id: selectedPlayer.id, name: selectedPlayer.name }}
                them={{ id: nm.themId, name: opp }}
                iAmPlayer1={match.player1Id === selectedPlayer.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
