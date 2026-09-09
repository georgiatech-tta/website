import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import RankingsTable from "./RankingsTable";

export const revalidate = 60;
export const metadata = buildMeta("Rankings", "Live player rankings and ratings for GT Table Tennis league.");

export default async function RankingsPage() {
  let players: { id: string; name: string; leagueRating: number; usattRating: number | null }[] = [];
  let histories: { playerId: string; rating: number; createdAt: Date }[] = [];
  try {
    [players, histories] = await Promise.all([
      prisma.player.findMany({
        where: { active: true },
        orderBy: { leagueRating: "desc" },
        select: { id: true, name: true, leagueRating: true, usattRating: true },
      }),
      prisma.ratingHistory.findMany({
        where: { player: { active: true } },
        select: { playerId: true, rating: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
  } catch {}

  const historyMapRaw = new Map<string, number[]>();
  for (const h of histories) {
    const arr = historyMapRaw.get(h.playerId) ?? [];
    arr.push(h.rating);
    historyMapRaw.set(h.playerId, arr.slice(-10));
  }
  const historyMap = Object.fromEntries(historyMapRaw);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Leaderboard
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        Player Rankings
      </h1>
      <p className="reveal stagger-2 text-base mb-10" style={{ color: "var(--text-secondary)" }}>
        Active members ordered by internal league rating. Updated after each league night.
      </p>

      {players.length === 0 ? (
        <div className="reveal glass p-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold" style={{ color: "var(--gt-gold)" }}>
            Coming Soon
          </p>
          <p className="display text-2xl mb-3" style={{ color: "var(--text-primary)" }}>
            Rankings launch after tryouts
          </p>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
            Player ratings will appear here once the season kicks off. Check back after the first league night.
          </p>
        </div>
      ) : (
        <div className="reveal glass overflow-hidden">
          <RankingsTable players={players} historyMap={historyMap} />
        </div>
      )}
    </div>
  );
}
