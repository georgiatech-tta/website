import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = { title: "Results | GT Table Tennis" };

export default async function ResultsPage() {
  const nights = await prisma.leagueNight.findMany({
    orderBy: { date: "desc" },
    include: { season: { select: { id: true, name: true } } },
  });

  // Group by season
  const bySeason = new Map<string, { seasonName: string; nights: typeof nights }>();
  for (const n of nights) {
    const key = n.season.id;
    if (!bySeason.has(key)) bySeason.set(key, { seasonName: n.season.name, nights: [] });
    bySeason.get(key)!.nights.push(n);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">League Results</h1>
      <p className="text-gray-500 mb-8">Click a night to see group standings and match scores.</p>

      {bySeason.size === 0 ? (
        <p className="text-gray-500">No results yet — check back after our next league night!</p>
      ) : (
        <div className="space-y-10">
          {[...bySeason.values()].map(({ seasonName, nights: sNights }) => (
            <div key={seasonName}>
              <h2 className="text-lg font-semibold text-[var(--gt-navy)] mb-3 border-b pb-1">{seasonName}</h2>
              <ul className="space-y-2">
                {sNights.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/results/${n.id}`}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 bg-white hover:bg-[var(--gt-light)] transition group"
                    >
                      <span className="font-medium text-[var(--gt-navy)] group-hover:underline">
                        {new Date(n.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-gray-400">View →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
