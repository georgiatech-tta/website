import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import RankingsTable from "./RankingsTable";

export const revalidate = 60;
export const metadata: Metadata = { title: "Rankings | GT Table Tennis" };

export default async function RankingsPage() {
  const players = await prisma.player.findMany({
    where: { active: true },
    orderBy: { leagueRating: "desc" },
    select: { id: true, name: true, leagueRating: true, usattRating: true },
  });

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
        <div className="reveal glass-sm p-8 text-center">
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No rankings yet</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Ratings will appear here after our first league night.
          </p>
        </div>
      ) : (
        <div className="reveal glass overflow-hidden">
          <RankingsTable players={players} />
        </div>
      )}
    </div>
  );
}
