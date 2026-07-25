import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ nightId: string }> }): Promise<Metadata> {
  const { nightId } = await params;
  const night = await prisma.leagueNight.findUnique({ where: { id: nightId }, select: { date: true } });
  if (!night) return { title: "Not Found | GT Table Tennis" };
  return {
    title: `Results – ${new Date(night.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} | GT Table Tennis`,
  };
}

export default async function NightResultsPage({ params }: { params: Promise<{ nightId: string }> }) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: {
      season: { select: { name: true } },
      groups: {
        include: {
          entries: {
            include: { player: { select: { name: true } } },
            orderBy: { placement: "asc" },
          },
          matches: true,
        },
        orderBy: { tableNumber: "asc" },
      },
    },
  });

  if (!night) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/results" className="text-sm text-[var(--gt-navy)] underline underline-offset-2 mb-4 inline-block">
        ← All results
      </Link>
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-1">
        {new Date(night.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </h1>
      <p className="text-gray-500 mb-8">{night.season.name}</p>

      {night.groups.length === 0 ? (
        <p className="text-gray-500">No group data recorded for this night.</p>
      ) : (
        <div className="space-y-10">
          {night.groups.map((group) => (
            <div key={group.id} className="border rounded-xl overflow-hidden">
              <div className="bg-[var(--gt-navy)] text-white px-4 py-2 font-semibold text-sm">
                {group.tableNumber != null ? `Table ${group.tableNumber}` : "Group"}
              </div>

              {/* Standings */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--gt-light)] text-[var(--gt-navy)] text-left">
                    <tr>
                      <th className="px-4 py-2">Place</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 text-right">Rating Before</th>
                      <th className="px-4 py-2 text-right">Rating After</th>
                      <th className="px-4 py-2 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((e) => {
                      const delta = e.ratingAfter != null ? e.ratingAfter - e.ratingBefore : null;
                      return (
                        <tr key={e.id} className="border-t">
                          <td className="px-4 py-2 text-gray-600">{e.placement ?? "—"}</td>
                          <td className="px-4 py-2 font-medium text-[var(--gt-navy)]">{e.player.name}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{e.ratingBefore}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{e.ratingAfter ?? "—"}</td>
                          <td className={`px-4 py-2 text-right font-semibold ${delta == null ? "" : delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-gray-400"}`}>
                            {delta == null ? "—" : delta > 0 ? `+${delta}` : delta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Match scores */}
              {group.matches.length > 0 && (
                <div className="border-t px-4 py-3 bg-white">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Match Scores</p>
                  <ul className="space-y-1 text-sm">
                    {group.matches.map((m) => {
                      const p1Name = group.entries.find((e) => e.playerId === m.player1Id)?.player.name ?? m.player1Id;
                      const p2Name = group.entries.find((e) => e.playerId === m.player2Id)?.player.name ?? m.player2Id;
                      return (
                        <li key={m.id} className="flex gap-2 items-center">
                          <span className={m.winnerId === m.player1Id ? "font-semibold text-[var(--gt-navy)]" : "text-gray-600"}>{p1Name}</span>
                          <span className="text-gray-400 text-xs">{m.scoreP1}</span>
                          <span className="text-gray-300">vs</span>
                          <span className="text-gray-400 text-xs">{m.scoreP2}</span>
                          <span className={m.winnerId === m.player2Id ? "font-semibold text-[var(--gt-navy)]" : "text-gray-600"}>{p2Name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
