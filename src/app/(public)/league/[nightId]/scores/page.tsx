import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ScoresFlow from "./ScoresFlow";

export default async function ScoresPage({
  params,
}: {
  params: Promise<{ nightId: string }>;
}) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: {
      season: true,
      groups: {
        orderBy: { tableNumber: "asc" },
        include: {
          entries: { include: { player: { select: { id: true, name: true, leagueRating: true } } } },
          matches: {
            select: {
              id: true,
              player1Id: true,
              player2Id: true,
              status: true,
              scoreP1: true,
              scoreP2: true,
              winnerId: true,
              rejectionReason: true,
            },
          },
        },
      },
    },
  });

  if (!night) notFound();

  if (night.status !== "in_progress") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p style={{ color: "var(--text-secondary)" }}>Score entry is not open for this session.</p>
      </div>
    );
  }

  const dateStr = new Date(night.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const groups = night.groups.map((g) => ({
    id: g.id,
    tableNumber: g.tableNumber,
    players: g.entries
      .filter((e) => e.playerId && e.player)
      .map((e) => ({ id: e.playerId!, name: e.player!.name, leagueRating: e.player!.leagueRating })),
    matches: g.matches,
  }));

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Score Entry</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {dateStr} — {night.season.name}
        </p>
      </div>
      <ScoresFlow groups={groups} />
    </div>
  );
}
