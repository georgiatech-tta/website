import { prisma } from "@/lib/db";
import BracketGeneratorClient from "@/components/admin/BracketGenerator";

export default async function BracketPage() {
  const players = await prisma.player.findMany({
    where: { active: true },
    orderBy: { leagueRating: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-2">Bracket Generator</h1>
      <p className="text-gray-500 text-sm mb-6">
        Select attendees, auto-generate skill-balanced groups, then drag to adjust before sending to league entry.
      </p>
      <BracketGeneratorClient players={players} />
    </div>
  );
}
