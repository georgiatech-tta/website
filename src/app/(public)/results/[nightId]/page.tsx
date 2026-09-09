import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import GameChips from "@/components/ui/GameChips";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ nightId: string }> }) {
  const { nightId } = await params;
  try {
    const night = await prisma.leagueNight.findUnique({ where: { id: nightId }, select: { date: true } });
    if (!night) return buildMeta("Not Found", "");
    const dateStr = new Date(night.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    return buildMeta(`Results – ${dateStr}`, `League night results for ${dateStr}.`);
  } catch { return buildMeta("Results", "League night results."); }
}

const DB_DOWN = <div className="max-w-4xl mx-auto px-4 py-16 text-center"><div className="glass-sm p-8" style={{ color: "var(--text-muted)" }}>Results temporarily unavailable — check back soon.</div></div>;

export default async function NightResultsPage({ params }: { params: Promise<{ nightId: string }> }) {
  const { nightId } = await params;

  let night: Awaited<ReturnType<typeof prisma.leagueNight.findUnique<{ where: { id: string }; include: { season: { select: { name: true } }; groups: { include: { entries: { include: { player: { select: { name: true } } }; orderBy: { placement: "asc" } }; matches: true }; orderBy: { tableNumber: "asc" } } } }>>>;
  try {
    night = await prisma.leagueNight.findUnique({
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
  } catch { return DB_DOWN; }

  if (!night) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/results"
        className="text-sm transition-colors hover:text-[var(--gt-gold-light)] mb-6 inline-block"
        style={{ color: "var(--gt-gold)" }}
      >
        ← All results
      </Link>

      <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "var(--gt-gold)" }}>
        {night.season.name}
      </p>
      <h1 className="display text-3xl md:text-4xl mb-10" style={{ color: "var(--text-primary)" }}>
        {new Date(night.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </h1>

      {night.groups.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No group data recorded for this night.</p>
      ) : (
        <div className="space-y-8">
          {night.groups.map((group, gi) => (
            <div key={group.id} className={`reveal-left stagger-${gi + 1} glass overflow-hidden`}>
              {/* Group header */}
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(179,163,105,0.06)" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(179,163,105,0.15)", color: "var(--gt-gold)" }}
                >
                  {group.tableNumber != null ? `Table ${group.tableNumber}` : "Group"}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {group.entries.length} players
                </span>
              </div>

              {/* Standings table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                      {["Place", "Player", "Before", "After", "Δ"].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${h === "Place" || h === "Player" ? "text-left" : "text-right"}`}
                          style={{ color: "var(--text-muted)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((e) => {
                      const delta = e.ratingAfter != null ? e.ratingAfter - e.ratingBefore : null;
                      return (
                        <tr key={e.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{e.placement ?? "—"}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                            {e.player?.name ?? e.guestName ?? "Guest"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{e.ratingBefore}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{e.ratingAfter ?? "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold font-mono text-sm">
                            <span style={{ color: delta == null ? "var(--text-muted)" : delta > 0 ? "#34d399" : delta < 0 ? "#f87171" : "var(--text-muted)" }}>
                              {delta == null ? "—" : delta > 0 ? `+${delta}` : delta}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Match scores */}
              {group.matches.length > 0 && (
                <div className="px-5 py-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    Match Scores
                  </p>
                  <ul className="space-y-2">
                    {group.matches.map((m) => {
                      const p1Entry = group.entries.find((e) => e.playerId === m.player1Id);
                      const p2Entry = group.entries.find((e) => e.playerId === m.player2Id);
                      const p1Name = p1Entry?.player?.name ?? p1Entry?.guestName ?? "P1";
                      const p2Name = p2Entry?.player?.name ?? p2Entry?.guestName ?? "P2";
                      return (
                        <li key={m.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span style={{ color: m.winnerId === m.player1Id ? "var(--text-primary)" : "var(--text-muted)", fontWeight: m.winnerId === m.player1Id ? 600 : 400 }}>
                            {p1Name}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>vs</span>
                          <span style={{ color: m.winnerId === m.player2Id ? "var(--text-primary)" : "var(--text-muted)", fontWeight: m.winnerId === m.player2Id ? 600 : 400 }}>
                            {p2Name}
                          </span>
                          {m.scoreP1 && m.scoreP2 && (
                            <GameChips scoreP1={m.scoreP1} scoreP2={m.scoreP2} winnerId={m.winnerId} player1Id={m.player1Id} />
                          )}
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
