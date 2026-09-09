import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Sparkline from "@/components/ui/Sparkline";
import GameChips from "@/components/ui/GameChips";

export const revalidate = 60;

interface Props {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { playerId } = await params;
  const player = await prisma.player.findUnique({ where: { id: playerId }, select: { name: true } });
  if (!player) return buildMeta("Player", "Player profile.");
  return buildMeta(player.name, `${player.name}'s rating history and match record at GT Table Tennis.`);
}

const PLACEMENT_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function PlayerProfilePage({ params }: Props) {
  const { playerId } = await params;

  const [player, groupEntries] = await Promise.all([
    prisma.player.findUnique({
      where: { id: playerId },
      include: { ratingHistory: { orderBy: { createdAt: "asc" }, take: 20 } },
    }),
    prisma.groupEntry.findMany({
      where: { playerId },
      include: {
        group: {
          include: {
            leagueNight: { include: { season: { select: { name: true } } } },
            matches: {
              where: { OR: [{ player1Id: playerId }, { player2Id: playerId }], status: "approved" },
              include: {
                group: {
                  include: {
                    entries: {
                      include: { player: { select: { id: true, name: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { group: { leagueNight: { date: "desc" } } },
      take: 20,
    }),
  ]);

  if (!player) notFound();

  const allMatches = groupEntries.flatMap((e) => e.group.matches);
  const wins = allMatches.filter((m) => m.winnerId === playerId).length;
  const winRate = allMatches.length > 0 ? Math.round((wins / allMatches.length) * 100) : null;
  const ratingHistory = player.ratingHistory.map((h) => h.rating);

  // Gather recent matches with opponent names
  const recentMatches = allMatches.slice(0, 10).map((m) => {
    const opponentId = m.player1Id === playerId ? m.player2Id : m.player1Id;
    const opponentEntry = m.group.entries.find((e) => e.player?.id === opponentId);
    const opponentName = opponentEntry?.player?.name ?? opponentEntry?.guestName ?? "Unknown";
    return { ...m, opponentName };
  });

  return (
    <div className="max-w-4xl mx-auto px-4">
      <PageHero label="Player Profile" title={player.name} />

      {/* Stats strip */}
      <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "League Rating", value: String(player.leagueRating), gold: true },
          { label: "USATT Rating", value: player.usattRating ? String(player.usattRating) : "—", gold: false },
          { label: "Matches Played", value: String(allMatches.length), gold: false },
          { label: "Win Rate", value: winRate !== null ? `${winRate}%` : "—", gold: false },
        ].map(({ label, value, gold }) => (
          <div key={label} className="glass p-4 text-center">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color: gold ? "var(--gt-gold)" : "var(--text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Rating history sparkline */}
      {ratingHistory.length >= 2 && (
        <div className="reveal glass p-6 mb-8">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--gt-gold)" }}>Rating History</p>
          <div className="flex items-end gap-4">
            <Sparkline data={ratingHistory} width={400} height={80} />
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Start</p>
              <p className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{ratingHistory[0]}</p>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Now</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--gt-gold)" }}>{ratingHistory[ratingHistory.length - 1]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div className="reveal mb-8">
          <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Recent Matches</h2>
          <div className="glass overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Opponent</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Score</th>
                  <th className="px-4 py-3 text-center text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Result</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right text-xs uppercase tracking-widest" style={{ color: "var(--gt-gold)" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((m) => {
                  const won = m.winnerId === playerId;
                  const isP1 = m.player1Id === playerId;
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(179,163,105,0.08)" }}>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{m.opponentName}</td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        {m.scoreP1 && m.scoreP2 && m.winnerId && (
                          <GameChips
                            scoreP1={isP1 ? m.scoreP1 : m.scoreP2}
                            scoreP2={isP1 ? m.scoreP2 : m.scoreP1}
                            winnerId={m.winnerId}
                            player1Id={playerId}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={
                            won
                              ? { background: "rgba(74,222,128,0.15)", color: "#4ade80" }
                              : { background: "rgba(248,113,113,0.12)", color: "#f87171" }
                          }
                        >
                          {won ? "W" : "L"}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                        {m.submittedAt
                          ? new Date(m.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* League nights attended */}
      {groupEntries.length > 0 && (
        <div className="reveal mb-8">
          <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>League Nights</h2>
          <div className="space-y-2">
            {groupEntries.map((e) => (
              <div key={e.id} className="glass-sm px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {new Date(e.group.leagueNight.date).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{e.group.leagueNight.season.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {e.ratingAfter && e.ratingBefore && (
                    <span
                      className="text-xs font-mono"
                      style={{ color: e.ratingAfter >= e.ratingBefore ? "#4ade80" : "#f87171" }}
                    >
                      {e.ratingAfter >= e.ratingBefore ? "+" : ""}{e.ratingAfter - e.ratingBefore}
                    </span>
                  )}
                  {e.placement !== null && e.placement !== undefined && (
                    <span className="text-sm">
                      {PLACEMENT_EMOJI[e.placement] ?? `${e.placement}th`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare CTA */}
      <div className="reveal mb-16 flex justify-center">
        <Link href={`/rankings/compare?a=${player.id}`} className="btn-glass">
          Compare with another player →
        </Link>
      </div>
    </div>
  );
}
