"use client";

import { useEffect, useState } from "react";
import TableSelectScreen from "./TableSelectScreen";
import MatchQueueScreen from "./MatchQueueScreen";
import ScoreEntryScreen from "./ScoreEntryScreen";

export interface KioskPlayer {
  id: string;
  name: string;
  leagueRating: number;
}

export interface KioskMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  scoreP1: string | null;
  scoreP2: string | null;
  status: string;
}

export interface KioskGroup {
  id: string;
  tableNumber: number | null;
  entries: {
    id: string;
    playerId: string | null;
    guestName: string | null;
    ratingBefore: number;
    player: KioskPlayer | null;
  }[];
  matches: KioskMatch[];
}

type Screen =
  | { type: "table-select" }
  | { type: "match-queue"; groupId: string }
  | { type: "score-entry"; matchId: string; groupId: string };

interface Props {
  nightId: string;
  groups: KioskGroup[];
}

export default function KioskShell({ nightId, groups: initialGroups }: Props) {
  const [groups, setGroups] = useState(initialGroups);
  const [screen, setScreen] = useState<Screen>({ type: "table-select" });

  useEffect(() => {
    document.body.setAttribute("data-kiosk", "true");
    return () => document.body.removeAttribute("data-kiosk");
  }, []);

  const updateMatch = (matchId: string, update: Partial<KioskMatch>) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        matches: g.matches.map((m) => (m.id === matchId ? { ...m, ...update } : m)),
      }))
    );
  };

  if (screen.type === "score-entry") {
    const group = groups.find((g) => g.id === screen.groupId);
    const match = group?.matches.find((m) => m.id === screen.matchId);
    if (!group || !match) return null;

    const getPlayer = (id: string | null) => {
      if (!id) return null;
      const entry = group.entries.find((e) => e.playerId === id);
      return entry?.player ?? null;
    };

    const p1 = getPlayer(match.player1Id);
    const p2 = getPlayer(match.player2Id);
    const pendingMatches = group.matches.filter((m) => m.status === "pending_entry");

    return (
      <ScoreEntryScreen
        match={match}
        player1={p1}
        player2={p2}
        onBack={() => setScreen({ type: "match-queue", groupId: screen.groupId })}
        onSuccess={(updatedMatch) => {
          updateMatch(match.id, updatedMatch);
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

  if (screen.type === "match-queue") {
    const group = groups.find((g) => g.id === screen.groupId);
    if (!group) return null;
    return (
      <MatchQueueScreen
        group={group}
        nightId={nightId}
        onBack={() => setScreen({ type: "table-select" })}
        onSelectMatch={(matchId) =>
          setScreen({ type: "score-entry", matchId, groupId: screen.groupId })
        }
      />
    );
  }

  return (
    <TableSelectScreen
      groups={groups}
      onSelectGroup={(groupId) => setScreen({ type: "match-queue", groupId })}
    />
  );
}
