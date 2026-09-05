import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import MatchScoreForm from "./MatchScoreForm";

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
          entries: { include: { player: { select: { name: true } } } },
          matches: true,
        },
      },
    },
  });

  if (!night) notFound();

  if (night.status !== "in_progress") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="text-gray-600">Score entry is not open for this night.</p>
      </div>
    );
  }

  const playerNames: Record<string, string> = {};
  for (const g of night.groups) {
    for (const e of g.entries) {
      if (e.playerId) playerNames[e.playerId] = e.player?.name ?? e.guestName ?? "Unknown";
    }
  }

  const dateStr = new Date(night.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Score Entry</h1>
        <p className="text-gray-500 text-sm mt-1">
          {dateStr} — {night.season.name}
        </p>
      </div>

      {night.groups.map((group) => (
        <div key={group.id} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-lg text-[var(--gt-navy)]">
            Table {group.tableNumber ?? "?"}
          </h2>
          <p className="text-sm text-gray-500">
            Players:{" "}
            {group.entries.map((e) => e.player?.name ?? e.guestName ?? "Guest").join(", ")}
          </p>

          <div className="space-y-4 divide-y">
            {group.matches.map((match) => {
              const p1Name = playerNames[match.player1Id] ?? match.player1Id;
              const p2Name = playerNames[match.player2Id] ?? match.player2Id;
              return (
              <div key={match.id} className="pt-4 first:pt-0">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {p1Name} vs {p2Name}
                </div>

                {match.status === "approved" ? (
                  <div className="text-green-600 text-sm flex items-center gap-2">
                    <span>✓</span>
                    <span>
                      {match.scoreP1} / {match.scoreP2} —{" "}
                      {match.winnerId === match.player1Id ? p1Name : p2Name}{" "}
                      wins
                    </span>
                  </div>
                ) : match.status === "pending_approval" ? (
                  <p className="text-gray-400 text-sm">⏳ Awaiting admin review</p>
                ) : (
                  <>
                    {match.status === "rejected" && match.rejectionReason && (
                      <p className="text-red-600 text-sm mb-2">
                        Rejected: {match.rejectionReason}
                      </p>
                    )}
                    <MatchScoreForm
                      matchId={match.id}
                      player1={{ id: match.player1Id, name: p1Name }}
                      player2={{ id: match.player2Id, name: p2Name }}
                    />
                  </>
                )}
              </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
