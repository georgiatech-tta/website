import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import EmptyState from "@/components/ui/EmptyState";

export const revalidate = 30;

interface Props {
  params: Promise<{ nightId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { nightId } = await params;
  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    select: { date: true, season: { select: { name: true } } },
  });
  if (!night) return buildMeta("Bracket", "League night bracket.");
  const date = new Date(night.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return buildMeta(`Bracket — ${date}`, `Round-robin bracket for ${night.season.name}.`);
}

export default async function BracketPage({ params }: Props) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: {
      season: { select: { name: true } },
      groups: {
        include: {
          entries: {
            include: { player: { select: { id: true, name: true } } },
            orderBy: { ratingBefore: "desc" },
          },
          matches: true,
        },
        orderBy: { tableNumber: "asc" },
      },
    },
  });

  if (!night) notFound();

  const formattedDate = new Date(night.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4">
      <PageHero label={night.season.name} title="Bracket" subtitle={formattedDate} />

      {night.groups.length === 0 ? (
        <div className="reveal mb-16">
          <EmptyState
            icon={<span style={{ fontSize: 32 }}>📋</span>}
            title="Bracket not yet set"
            body="Groups haven't been assigned for this league night. Check back closer to game time."
          />
        </div>
      ) : (
        <div className="reveal overflow-x-auto pb-8">
          <div className="flex gap-4" style={{ minWidth: `${night.groups.length * 280}px` }}>
            {night.groups.map((group) => {
              const entries = group.entries;
              // Build round-robin matrix
              const matrix: (typeof group.matches[0] | null)[][] = entries.map(() =>
                entries.map(() => null)
              );
              for (const match of group.matches) {
                const i = entries.findIndex(
                  (e) => e.player?.id === match.player1Id || e.guestName === match.player1Id
                );
                const j = entries.findIndex(
                  (e) => e.player?.id === match.player2Id || e.guestName === match.player2Id
                );
                if (i !== -1 && j !== -1) {
                  matrix[i][j] = match;
                }
              }

              return (
                <div key={group.id} className="glass flex-shrink-0" style={{ width: 264 }}>
                  {/* Group header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <p className="display text-lg" style={{ color: "var(--text-primary)" }}>
                      Table {group.tableNumber ?? "—"}
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(179,163,105,0.15)", color: "var(--gt-gold)" }}
                    >
                      {entries.length} players
                    </span>
                  </div>

                  {/* Player list */}
                  <div className="px-4 py-3 space-y-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {entries.map((entry, idx) => {
                      const name = entry.player?.name ?? entry.guestName ?? "Guest";
                      const delta = entry.ratingAfter != null ? entry.ratingAfter - entry.ratingBefore : null;
                      return (
                        <div key={entry.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {entry.placement != null && (
                              <span>{PLACEMENT_EMOJI[entry.placement] ?? `${entry.placement}.`}</span>
                            )}
                            <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              {entry.ratingBefore}
                            </span>
                            {delta != null && (
                              <span
                                className="text-xs font-mono"
                                style={{ color: delta >= 0 ? "#4ade80" : "#f87171" }}
                              >
                                {delta >= 0 ? "+" : ""}{delta}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Round-robin matrix */}
                  {entries.length >= 2 && (
                    <div className="px-4 py-3 overflow-x-auto">
                      <table className="text-xs w-full">
                        <thead>
                          <tr>
                            <th className="w-6" />
                            {entries.map((_, j) => (
                              <th key={j} className="text-center pb-1" style={{ color: "var(--text-muted)", width: 36 }}>
                                {j + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((rowEntry, i) => (
                            <tr key={rowEntry.id}>
                              <td className="pr-2 font-semibold" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                              {entries.map((_, j) => {
                                if (i === j) {
                                  return (
                                    <td key={j} className="text-center py-0.5" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4 }}>
                                      <span style={{ color: "var(--text-muted)" }}>—</span>
                                    </td>
                                  );
                                }
                                const match = matrix[i][j] ?? matrix[j][i];
                                if (!match) {
                                  return (
                                    <td key={j} className="text-center py-0.5" style={{ color: "var(--text-muted)" }}>·</td>
                                  );
                                }
                                const rowPlayerId = rowEntry.player?.id;
                                const won = match.winnerId && rowPlayerId && match.winnerId === rowPlayerId;
                                const score = (() => {
                                  if (!match.scoreP1 || !match.scoreP2) return "✓";
                                  const isP1 = match.player1Id === rowPlayerId;
                                  const games1 = (isP1 ? match.scoreP1 : match.scoreP2).split(",").map(Number);
                                  const games2 = (isP1 ? match.scoreP2 : match.scoreP1).split(",").map(Number);
                                  const w1 = games1.filter((g, k) => g > games2[k]).length;
                                  const w2 = games2.filter((g, k) => g > games1[k]).length;
                                  return `${w1}-${w2}`;
                                })();
                                return (
                                  <td
                                    key={j}
                                    className="text-center py-0.5 font-mono"
                                    style={{
                                      color: won ? "var(--gt-gold)" : "var(--text-muted)",
                                      background: won ? "rgba(179,163,105,0.12)" : "transparent",
                                      borderRadius: 4,
                                    }}
                                  >
                                    {score}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const PLACEMENT_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
