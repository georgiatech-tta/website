"use client";

import Link from "next/link";
import type { KioskGroup } from "./KioskShell";

interface Props {
  group: KioskGroup;
  nightId: string;
  onBack: () => void;
  onSelectMatch: (matchId: string) => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_entry: { label: "Pending", color: "var(--gt-gold)" },
  pending_approval: { label: "Submitted", color: "var(--text-muted)" },
  approved: { label: "Approved", color: "#4ade80" },
  rejected: { label: "Rejected", color: "#f87171" },
};

export default function MatchQueueScreen({ group, nightId, onBack, onSelectMatch }: Props) {
  const getName = (id: string | null) => {
    if (!id) return "?";
    const entry = group.entries.find((e) => e.playerId === id);
    return entry?.player?.name ?? entry?.guestName ?? "Guest";
  };

  const getRating = (id: string | null) => {
    if (!id) return null;
    const entry = group.entries.find((e) => e.playerId === id);
    return entry?.player?.leagueRating ?? entry?.ratingBefore ?? null;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-sm" style={{ color: "var(--text-muted)" }}>
            ← Back
          </button>
          <p className="display text-xl" style={{ color: "var(--text-primary)" }}>
            Table {group.tableNumber ?? "—"}
          </p>
          <Link href={`/league/${nightId}`} className="text-xs" style={{ color: "var(--text-muted)" }}>
            Exit
          </Link>
        </div>

        {/* Match cards */}
        <div className="space-y-3">
          {group.matches.map((match) => {
            const statusInfo = STATUS_LABEL[match.status] ?? { label: match.status, color: "var(--text-muted)" };
            const canEnter = match.status === "pending_entry" || match.status === "rejected";
            return (
              <button
                key={match.id}
                disabled={!canEnter}
                onClick={() => canEnter && onSelectMatch(match.id)}
                className="w-full text-left glass p-5"
                style={{
                  minHeight: 80,
                  opacity: canEnter ? 1 : 0.6,
                  cursor: canEnter ? "pointer" : "default",
                  transition: "border-color 200ms",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {getName(match.player1Id)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {getRating(match.player1Id)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {getName(match.player2Id)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {getRating(match.player2Id)}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                    style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
