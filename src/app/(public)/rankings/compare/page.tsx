import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";
import CompareSelect from "./CompareSelect";
import Sparkline from "@/components/ui/Sparkline";
import GameChips from "@/components/ui/GameChips";
import EmptyState from "@/components/ui/EmptyState";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { a, b } = await searchParams;
  if (a && b) {
    const [p1, p2] = await Promise.all([
      prisma.player.findUnique({ where: { id: a }, select: { name: true } }),
      prisma.player.findUnique({ where: { id: b }, select: { name: true } }),
    ]);
    if (p1 && p2) return buildMeta(`${p1.name} vs ${p2.name}`, "Head-to-head comparison.");
  }
  return buildMeta("Compare Players", "Head-to-head player comparison for GT Table Tennis.");
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  const allPlayers = await prisma.player.findMany({
    where: { active: true },
    orderBy: { leagueRating: "desc" },
    select: { id: true, name: true, leagueRating: true },
  });

  if (!a || !b) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
          Head-to-Head
        </p>
        <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
          Compare Players
        </h1>
        <p className="reveal stagger-2 text-base mb-10" style={{ color: "var(--text-secondary)" }}>
          Select two players to see their ratings, trends, and match history.
        </p>
        <div className="reveal glass p-8">
          <CompareSelect players={allPlayers} preselect={a} />
        </div>
      </div>
    );
  }

  const [p1, p2, matches] = await Promise.all([
    prisma.player.findUnique({
      where: { id: a },
      include: { ratingHistory: { orderBy: { createdAt: "asc" }, take: 10 } },
    }),
    prisma.player.findUnique({
      where: { id: b },
      include: { ratingHistory: { orderBy: { createdAt: "asc" }, take: 10 } },
    }),
    prisma.match.findMany({
      where: {
        OR: [
          { player1Id: a, player2Id: b },
          { player1Id: b, player2Id: a },
        ],
        status: "approved",
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  if (!p1 || !p2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass p-8 text-center">
          <p style={{ color: "var(--text-muted)" }}>One or both players not found.</p>
          <Link href="/rankings/compare" className="btn-glass mt-4 inline-flex">Try again →</Link>
        </div>
      </div>
    );
  }

  const p1Wins = matches.filter((m) => m.winnerId === p1.id).length;
  const p2Wins = matches.filter((m) => m.winnerId === p2.id).length;
  const lastMatch = matches[0];

  const p1History = p1.ratingHistory.map((h) => h.rating);
  const p2History = p2.ratingHistory.map((h) => h.rating);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-2">
        <Link href="/rankings/compare" className="text-xs" style={{ color: "var(--text-muted)" }}>
          ← Change players
        </Link>
      </div>
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Head-to-Head
      </p>
      <h1 className="reveal stagger-1 display text-3xl md:text-4xl mb-8" style={{ color: "var(--text-primary)" }}>
        {p1.name} vs {p2.name}
      </h1>

      {/* Player cards */}
      <div className="reveal grid grid-cols-2 gap-4 mb-6">
        {[
          { player: p1, wins: p1Wins, history: p1History },
          { player: p2, wins: p2Wins, history: p2History },
        ].map(({ player, wins, history }) => (
          <div key={player.id} className="glass p-6">
            <Link href={`/rankings/${player.id}`} className="hover:underline underline-offset-2">
              <p className="display text-2xl mb-1" style={{ color: "var(--text-primary)" }}>{player.name}</p>
            </Link>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--gt-gold)" }}>{player.leagueRating}</p>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              USATT: {player.usattRating ?? "—"}
            </p>
            {matches.length > 0 && (
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                {wins}W – {matches.length - wins}L vs opponent
              </p>
            )}
            {history.length >= 2 && (
              <Sparkline data={history} width={120} height={40} />
            )}
          </div>
        ))}
      </div>

      {/* H2H stats */}
      {matches.length > 0 && (
        <div className="reveal glass-sm px-5 py-3 mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          {matches.length} match{matches.length !== 1 ? "es" : ""} · {p1.name} won {p1Wins} · {p2.name} won {p2Wins}
          {lastMatch?.submittedAt && (
            <span> · Last played {new Date(lastMatch.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          )}
        </div>
      )}

      {/* Match history */}
      <div className="reveal">
        <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Match History</h2>
        {matches.length === 0 ? (
          <EmptyState
            icon={<span style={{ fontSize: 28 }}>🏓</span>}
            title="No matches yet"
            body="These two players haven't played each other in a recorded match."
          />
        ) : (
          <div className="space-y-2">
            {matches.map((m) => {
              const isP1Player1 = m.player1Id === p1.id;
              const winnerName = m.winnerId === p1.id ? p1.name : p2.name;
              return (
                <div key={m.id} className="glass p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: m.winnerId === p1.id ? "var(--gt-gold)" : "var(--text-secondary)" }}>{p1.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>vs</span>
                    <span style={{ color: m.winnerId === p2.id ? "var(--gt-gold)" : "var(--text-secondary)" }}>{p2.name}</span>
                    {m.submittedAt && (
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        {new Date(m.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  {m.scoreP1 && m.scoreP2 && m.winnerId && (
                    <GameChips
                      scoreP1={isP1Player1 ? m.scoreP1 : m.scoreP2}
                      scoreP2={isP1Player1 ? m.scoreP2 : m.scoreP1}
                      winnerId={m.winnerId}
                      player1Id={p1.id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
