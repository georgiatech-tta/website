import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 30;
export const metadata: Metadata = { title: "League | GT Table Tennis" };

export default async function LeaguePage() {
  const nights = await prisma.leagueNight.findMany({
    orderBy: { date: "desc" },
    include: {
      season: { select: { id: true, name: true } },
      registrations: { select: { id: true } },
    },
  });

  const openNight = nights.find((n) => n.status === "registration_open");
  const inProgressNight = nights.find((n) => n.status === "in_progress");

  // Group completed nights by season
  const completed = nights.filter((n) => n.status === "completed");
  const bySeason = new Map<string, { seasonName: string; nights: typeof completed }>();
  for (const n of completed) {
    const key = n.season.id;
    if (!bySeason.has(key)) bySeason.set(key, { seasonName: n.season.name, nights: [] });
    bySeason.get(key)!.nights.push(n);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Friday Night League</h1>
      <p className="text-gray-500 mb-8">Weekly round-robin league open to all club members.</p>

      {/* Open registration banner */}
      {openNight && (
        <div className="bg-[var(--gt-navy)] text-white rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[var(--gt-gold)] font-semibold text-sm uppercase tracking-wide mb-1">Registration Open</p>
            <p className="text-xl font-bold">
              {new Date(openNight.date).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>
            <p className="text-white/70 text-sm mt-1">
              {openNight.registrations.length} / 32 signed up
            </p>
          </div>
          <Link
            href={`/league/${openNight.id}/register`}
            className="shrink-0 bg-[var(--gt-gold)] text-[var(--gt-navy)] font-bold px-6 py-3 rounded-lg hover:brightness-110 transition text-center"
          >
            Sign Up →
          </Link>
        </div>
      )}

      {/* In-progress banner */}
      {inProgressNight && !openNight && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-wide mb-1">League In Progress</p>
            <p className="text-lg font-bold text-[var(--gt-navy)]">
              {new Date(inProgressNight.date).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <Link
            href={`/league/${inProgressNight.id}/scores`}
            className="shrink-0 bg-[var(--gt-navy)] text-white font-semibold px-5 py-2.5 rounded-lg hover:brightness-110 transition text-center text-sm"
          >
            Enter Scores →
          </Link>
        </div>
      )}

      {/* No active night */}
      {!openNight && !inProgressNight && (
        <div className="bg-[var(--gt-light)] border rounded-xl p-5 mb-8 text-sm text-gray-600 text-center">
          No league night currently scheduled. Check the Discord for announcements.
        </div>
      )}

      {/* How it works */}
      <div className="bg-[var(--gt-light)] border rounded-xl p-5 mb-10 text-sm text-gray-700 space-y-2">
        <p className="font-semibold text-[var(--gt-navy)] text-base mb-1">How the League Works</p>
        <p>
          Players are placed into <strong>round-robin groups of 3–6</strong> based on their current rating.
          Each player plays one match against every other player in their group.
          Results update ratings using the <strong>USATT formula</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
          <li>Sessions capped at <strong>32 players</strong> — first come, first served</li>
          <li>Sign up via the button above when registration opens</li>
          <li>If you signed up but can't make it, let leadership know on Discord</li>
          <li>No experience required — open to all skill levels</li>
        </ul>
      </div>

      {/* Past results */}
      {bySeason.size > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-5">Past Results</h2>
          <div className="space-y-8">
            {[...bySeason.values()].map(({ seasonName, nights: sNights }) => (
              <div key={seasonName}>
                <h3 className="text-base font-semibold text-[var(--gt-navy)] mb-3 border-b pb-1">{seasonName}</h3>
                <ul className="space-y-2">
                  {sNights.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/results/${n.id}`}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 bg-white hover:bg-[var(--gt-light)] transition group"
                      >
                        <span className="font-medium text-[var(--gt-navy)] group-hover:underline">
                          {new Date(n.date).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-gray-400">Results →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
