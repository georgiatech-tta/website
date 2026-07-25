import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function LeagueIndexPage() {
  const nights = await prisma.leagueNight.findMany({
    include: { season: true, groups: { include: { entries: true } } },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">League Nights</h1>
        <Link href="/admin/league/new" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition">
          + Enter New Night
        </Link>
      </div>

      {nights.length === 0 ? (
        <p className="text-gray-500">No league nights yet. Enter the first one above.</p>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {nights.map((n) => (
            <Link key={n.id} href={`/admin/league/${n.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
              <div>
                <p className="font-medium">{new Date(n.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="text-sm text-gray-500">{n.season.name} · {n.groups.length} groups · {n.groups.reduce((s, g) => s + g.entries.length, 0)} players</p>
              </div>
              <span className="text-sm text-gray-400">Edit →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
