"use client";

import { useState } from "react";
import ScoreEntryScreen from "@/components/kiosk/ScoreEntryScreen";
import type { KioskMatch, KioskPlayer } from "@/components/kiosk/KioskShell";

interface Player {
  id: string;
  name: string;
  leagueRating: number;
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

type Screen =
  | { type: "group-select" }
  | { type: "match-queue"; groupId: string }
  | { type: "score-entry"; matchId: string; groupId: string };

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending_entry:    { label: "Pending",   color: "var(--gt-gold)" },
  pending_approval: { label: "Submitted", color: "var(--text-muted)" },
  approved:         { label: "Approved",  color: "#4ade80" },
  rejected:         { label: "Rejected",  color: "#f87171" },
};

export default function ScoresFlow({ groups: initialGroups }: Props) {
  const [groups, setGroups] = useState(initialGroups);
  const [screen, setScreen] = useState<Screen>({ type: "group-select" });

  const updateMatch = (matchId: string, update: Partial<Match>) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        matches: g.matches.map((m) => (m.id === matchId ? { ...m, ...update } : m)),
      }))
    );
  };

  // Score entry — reuse kiosk ScoreEntryScreen directly
  if (screen.type === "score-entry") {
    const group = groups.find((g) => g.id === screen.groupId);
    const match = group?.matches.find((m) => m.id === screen.matchId);
    if (!group || !match) return null;

    const getPlayer = (id: string): KioskPlayer | null =>
      group.players.find((p) => p.id === id) ?? null;

    const kioskMatch: KioskMatch = match;
    const pendingMatches = group.matches.filter((m) => m.status === "pending_entry");

    return (
      <ScoreEntryScreen
        match={kioskMatch}
        player1={getPlayer(match.player1Id)}
        player2={getPlayer(match.player2Id)}
        onBack={() => setScreen({ type: "match-queue", groupId: screen.groupId })}
        onSuccess={(updated) => {
          updateMatch(match.id, updated);
          const nextPending = pendingMatches.find((m) => m.id !== match.id);
          setTimeout(() => {
            if (nextPending) {
              setScreen({ type: "score-entry", matchId: nextPending.id, groupId: screen.groupId });
            } else {
              setScreen({ type: "match-queue", groupId: screen.groupId });
            }
          }, 2000);
        }}
      />
    );
  }

  // Match queue — all matches in the group, tap to enter score
  if (screen.type === "match-queue") {
    const group = groups.find((g) => g.id === screen.groupId);
    if (!group) return null;

    const getName = (id: string) => group.players.find((p) => p.id === id)?.name ?? "Unknown";
    const getRating = (id: string) => group.players.find((p) => p.id === id)?.leagueRating ?? "";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setScreen({ type: "group-select" })}
            className="text-sm"
            style={{ color: "var(--gt-gold)" }}
          >
            ← Back
          </button>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Group {group.tableNumber}
          </p>
          <div style={{ width: 48 }} />
        </div>

        <div className="space-y-2">
          {group.matches.map((match) => {
            const canTap = match.status === "pending_entry" || match.status === "rejected";
            const statusInfo = STATUS_STYLE[match.status] ?? { label: match.status, color: "var(--text-muted)" };
            return (
              <button
                key={match.id}
                type="button"
                disabled={!canTap}
                onClick={() =>
                  canTap && setScreen({ type: "score-entry", matchId: match.id, groupId: group.id })
                }
                className="w-full text-left glass rounded-xl p-4 transition"
                style={canTap ? { cursor: "pointer" } : { opacity: 0.6, cursor: "default" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {getName(match.player1Id)} vs {getName(match.player2Id)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {getRating(match.player1Id)} · {getRating(match.player2Id)}
                    </p>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                </div>
                {match.status === "rejected" && match.rejectionReason && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    Rejected: {match.rejectionReason}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Group select
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        Which group?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setScreen({ type: "match-queue", groupId: g.id })}
            className="text-left glass glass-hover rounded-xl p-4 transition"
          >
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Group {g.tableNumber}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {g.players.map((p) => p.name).join(" · ")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
