import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";

export const revalidate = 30;
export const metadata = buildMeta("Tryouts", "Fall 2025 team tryout group brackets and scores.");

type Match = {
  id: string;
  player1Id: string;
  player2Id: string;
  scoreP1: string | null;
  scoreP2: string | null;
  winnerId: string | null;
  status: string;
};

type Entry = {
  playerId: string | null;
  player: { id: string; name: string } | null;
};

type Group = {
  id: string;
  tableNumber: number | null;
  entries: Entry[];
  matches: Match[];
};

function computeStandings(entries: Entry[], matches: Match[]) {
  const wins = new Map<string, number>();
  const losses = new Map<string, number>();
  for (const e of entries) {
    if (e.playerId) { wins.set(e.playerId, 0); losses.set(e.playerId, 0); }
  }
  for (const m of matches) {
    if (m.status !== "approved" || !m.winnerId) continue;
    const loserId = m.winnerId === m.player1Id ? m.player2Id : m.player1Id;
    wins.set(m.winnerId, (wins.get(m.winnerId) ?? 0) + 1);
    losses.set(loserId, (losses.get(loserId) ?? 0) + 1);
  }
  return { wins, losses };
}

function getTopTwo(entries: Entry[], wins: Map<string, number>, matches: Match[]): Set<string> {
  const players = entries
    .filter((e): e is Entry & { playerId: string } => e.playerId !== null)
    .sort((a, b) => {
      const wDiff = (wins.get(b.playerId) ?? 0) - (wins.get(a.playerId) ?? 0);
      if (wDiff !== 0) return wDiff;
      // head-to-head tiebreak
      const h2h = matches.find(
        (m) => m.status === "approved" &&
          ((m.player1Id === a.playerId && m.player2Id === b.playerId) ||
           (m.player1Id === b.playerId && m.player2Id === a.playerId))
      );
      if (h2h?.winnerId === b.playerId) return 1;
      if (h2h?.winnerId === a.playerId) return -1;
      return 0;
    });
  return new Set(players.slice(0, 2).map((e) => e.playerId));
}

export default async function TryoutsPage() {
  let night: { id: string; groups: Group[] } | null = null;
  let dbError: string | null = null;
  try {
    night = await prisma.leagueNight.findFirst({
      where: { isTryout: true },
      orderBy: { date: "desc" },
      select: {
        id: true,
        groups: {
          orderBy: { tableNumber: "asc" },
          select: {
            id: true,
            tableNumber: true,
            entries: {
              select: {
                playerId: true,
                player: { select: { id: true, name: true } },
              },
            },
            matches: {
              select: {
                id: true,
                player1Id: true,
                player2Id: true,
                scoreP1: true,
                scoreP2: true,
                winnerId: true,
                status: true,
              },
            },
          },
        },
      },
    });
  } catch (e) { console.error("tryouts DB error:", e); dbError = String(e); }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Fall 2025
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        Team Tryouts
      </h1>
      <p className="reveal stagger-2 text-base mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        8 groups · Top 2 from each group advance · All matches BO3
      </p>

      {night && (
        <div className="reveal stagger-3 mb-10 flex flex-wrap gap-3">
          <Link
            href={`/league/${night.id}/scores`}
            className="btn-gold text-sm"
          >
            Enter Scores →
          </Link>
          <Link
            href={`/league/${night.id}/kiosk`}
            className="btn-glass text-sm"
          >
            Kiosk Mode
          </Link>
        </div>
      )}

      {!night ? (
        <div className="reveal glass p-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold" style={{ color: "var(--gt-gold)" }}>
            Coming Soon
          </p>
          <p className="display text-2xl" style={{ color: "var(--text-primary)" }}>
            Brackets not yet published
          </p>
          {dbError && <p className="text-xs mt-4 text-red-400 break-all">{dbError}</p>}
          <p className="text-xs mt-2 text-yellow-400">{process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : "DB_URL unset"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {night.groups.map((group, gi) => {
            const { wins, losses } = computeStandings(group.entries, group.matches);
            const topTwo = getTopTwo(group.entries, wins, group.matches);
            const anyApproved = group.matches.some((m) => m.status === "approved");

            return (
              <div key={group.id} className="reveal glass p-4">
                <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: "var(--gt-gold)" }}>
                  Group {gi + 1}
                </p>

                {/* Player standings */}
                <ol className="space-y-1.5 mb-4">
                  {group.entries
                    .filter((e) => e.player)
                    .sort((a, b) => {
                      if (!anyApproved) return 0;
                      return (wins.get(b.playerId!) ?? 0) - (wins.get(a.playerId!) ?? 0);
                    })
                    .map((entry, idx) => {
                      const pid = entry.playerId!;
                      const isTop = topTwo.has(pid) && anyApproved;
                      const w = wins.get(pid) ?? 0;
                      const l = losses.get(pid) ?? 0;
                      return (
                        <li key={pid} className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs w-4 shrink-0 text-right" style={{ color: "var(--text-muted)" }}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span
                              className="truncate"
                              style={{ color: isTop ? "var(--gt-gold)" : "var(--text-secondary)", fontWeight: isTop ? 600 : 400 }}
                            >
                              {entry.player!.name}
                            </span>
                          </div>
                          {anyApproved && (
                            <span className="text-xs shrink-0" style={{ color: isTop ? "var(--gt-gold)" : "var(--text-muted)" }}>
                              {w}–{l}
                            </span>
                          )}
                        </li>
                      );
                    })}
                </ol>

                {/* Match scores */}
                <div className="space-y-1">
                  {group.matches.map((m) => {
                    const p1 = group.entries.find((e) => e.playerId === m.player1Id)?.player;
                    const p2 = group.entries.find((e) => e.playerId === m.player2Id)?.player;
                    if (!p1 || !p2) return null;
                    const done = m.status === "approved";
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs gap-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span
                          className="truncate"
                          style={{ color: done && m.winnerId === p1.id ? "var(--text-secondary)" : undefined, fontWeight: done && m.winnerId === p1.id ? 600 : undefined }}
                        >
                          {p1.name.split(" ")[0]}
                        </span>
                        <span className="shrink-0 font-mono" style={{ color: done ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {done && m.scoreP1 && m.scoreP2 ? `${m.scoreP1.split(",").filter(s => {
                            const [a] = s.split("-").map(Number); return (m.winnerId === p1.id ? a : (Number(s.split("-")[1])));
                          })}` : "–"}
                        </span>
                        <span
                          className="truncate text-right"
                          style={{ color: done && m.winnerId === p2.id ? "var(--text-secondary)" : undefined, fontWeight: done && m.winnerId === p2.id ? 600 : undefined }}
                        >
                          {p2.name.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {anyApproved && topTwo.size >= 2 && group.matches.every((m) => m.status === "approved") && (
                  <p className="text-xs mt-3 pt-3 border-t font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--gt-gold)" }}>
                    Top 2 advance ✓
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
