import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GenerateBracketButton, RemoveButton } from "./Actions";
import MatchApprovalPanel, { type MatchWithPlayers } from "@/components/admin/MatchApprovalPanel";

const STATUS_BADGE: Record<string, string> = {
  registration_open: "bg-green-100 text-green-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-gray-100 text-gray-600",
};

const STATUS_LABEL: Record<string, string> = {
  registration_open: "Registration Open",
  in_progress: "In Progress",
  completed: "Completed",
};

const MATCH_BADGE: Record<string, string> = {
  pending_entry: "bg-gray-100 text-gray-500",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export default async function AdminNightDetailPage({
  params,
}: {
  params: Promise<{ nightId: string }>;
}) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: {
      season: true,
      registrations: {
        orderBy: { createdAt: "desc" },
        include: { player: { select: { name: true, leagueRating: true } } },
      },
      groups: {
        orderBy: { tableNumber: "asc" },
        include: {
          entries: {
            include: { player: { select: { name: true } } },
          },
          matches: {
            include: {
              // ponytail: player1/player2 are FK to Player — use raw IDs and look up names from entries
            },
          },
        },
      },
    },
  });

  if (!night) notFound();

  const formattedDate = new Date(night.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const badgeClass = STATUS_BADGE[night.status] ?? "bg-gray-100 text-gray-500";
  const badgeLabel = STATUS_LABEL[night.status] ?? night.status;

  // Build player name lookup from entries for match display
  const playerNameMap: Record<string, string> = {};
  for (const g of night.groups) {
    for (const e of g.entries) {
      if (e.playerId) playerNameMap[e.playerId] = e.player?.name ?? e.guestName ?? e.playerId;
    }
  }

  // Build MatchWithPlayers for MatchApprovalPanel
  const allMatches: MatchWithPlayers[] = night.groups.flatMap((g) =>
    g.matches.map((m) => ({
      ...m,
      scoreP1: m.scoreP1 ?? null,
      scoreP2: m.scoreP2 ?? null,
      player1: { name: playerNameMap[m.player1Id] ?? m.player1Id },
      player2: { name: playerNameMap[m.player2Id] ?? m.player2Id },
      group: { tableNumber: g.tableNumber },
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/league" className="text-sm text-gray-400 hover:text-gray-600">← League Nights</Link>
          <h1 className="text-2xl font-bold text-[var(--gt-navy)] mt-1">{formattedDate}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{night.season.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{badgeLabel}</span>
      </div>

      {/* registration_open view */}
      {night.status === "registration_open" && (
        <>
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--gt-navy)]">
                Registrations ({night.registrations.length})
              </h2>
              <GenerateBracketButton nightId={nightId} />
            </div>

            {night.registrations.length === 0 ? (
              <p className="text-gray-400 text-sm">No registrations yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 font-medium pb-2">Name</th>
                    <th className="text-left text-gray-500 font-medium pb-2">Rating</th>
                    <th className="text-left text-gray-500 font-medium pb-2">Type</th>
                    <th className="text-left text-gray-500 font-medium pb-2">Registered</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {night.registrations.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 font-medium">{r.player?.name ?? r.guestName}</td>
                      <td className="py-2 text-gray-500">{r.player?.leagueRating ?? "—"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.playerId ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                          {r.playerId ? "Roster" : "Guest"}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {new Date(r.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td className="py-2 text-right">
                        <RemoveButton registrationId={r.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-400">
              Public registration link:{" "}
              <Link href={`/league/${nightId}/register`} className="text-[var(--gt-navy)] underline">
                /league/{nightId}/register
              </Link>
            </p>
          </div>
        </>
      )}

      {/* in_progress view */}
      {night.status === "in_progress" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Players submit scores at the link below. Approve or reject each match here.
            </p>
            <Link href={`/league/${nightId}/scores`} className="border border-[var(--gt-navy)] text-[var(--gt-navy)] px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
              Public Score Entry →
            </Link>
          </div>
          <MatchApprovalPanel matches={allMatches} nightId={nightId} />
        </div>
      )}

      {/* completed view */}
      {night.status === "completed" && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-[var(--gt-navy)]">Final Ratings</h2>
          {night.groups.map((group) => (
            <div key={group.id}>
              <p className="text-sm font-medium text-gray-500 mb-2">Table {group.tableNumber}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 font-medium pb-1">Player</th>
                    <th className="text-left text-gray-500 font-medium pb-1">Before</th>
                    <th className="text-left text-gray-500 font-medium pb-1">After</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {group.entries.map((e) => (
                    <tr key={e.id}>
                      <td className="py-1.5">{e.player?.name ?? e.guestName ?? "Guest"}</td>
                      <td className="py-1.5 text-gray-500">{e.ratingBefore}</td>
                      <td className="py-1.5 font-medium">{e.ratingAfter ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
