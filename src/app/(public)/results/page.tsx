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
      <p className="text-gray-500 mb-6">Click a night to see group standings and match scores.</p>

      {/* League overview callout */}
      <div className="bg-[var(--gt-light)] border rounded-xl p-5 mb-10 text-sm text-gray-700 space-y-2">
        <p className="font-semibold text-[var(--gt-navy)] text-base">How the League Works</p>
        <p>
          Players are placed into <strong>round-robin groups of 3–6</strong> based on their current rating. Each player plays
          one match against every other player in their group. Match results are used to update ratings via the USATT formula.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Sessions are capped at <strong>32 players</strong></li>
          <li>You <strong>must sign up</strong> via the Google Form posted in Discord each week</li>
          <li>If you signed up but can&apos;t attend, notify leadership on Discord</li>
        </ul>
        <p className="text-gray-500 text-xs pt-1">
          Looking for older results?{" "}
          <a
            href="https://tta.gtorg.gatech.edu/league"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--gt-navy)] underline underline-offset-2"
          >
            View the historical archive (2014–2025) →
          </a>
        </p>
      </div>

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
