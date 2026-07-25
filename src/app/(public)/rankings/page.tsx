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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Player Rankings</h1>
      <p className="text-gray-500 mb-6">Active members ordered by internal league rating.</p>
      {players.length === 0 ? (
        <p className="text-gray-500">No rankings yet — check back after our first league night!</p>
      ) : (
        <RankingsTable players={players} />
      )}
    </div>
  );
}
