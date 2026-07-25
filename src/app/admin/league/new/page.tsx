import { prisma } from "@/lib/db";
import LeagueEntryForm from "@/components/admin/LeagueEntryForm";

export default async function NewLeagueNightPage() {
  const [players, seasons] = await Promise.all([
    prisma.player.findMany({ where: { active: true }, orderBy: { leagueRating: "desc" } }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Enter League Night Results</h1>
      <LeagueEntryForm players={players} seasons={seasons} />
    </div>
  );
}
