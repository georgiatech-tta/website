import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";

export const revalidate = 30;
export const metadata = buildMeta("League", "Sign up for weekly league nights and view match results.");

const DB_DOWN = (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>Weekly Competition</p>
    <h1 className="display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>Friday Night League</h1>
    <div className="glass-sm p-8 text-center mt-8" style={{ color: "var(--text-muted)" }}>Database temporarily unavailable — check back soon.</div>
  </div>
);

export default async function LeaguePage() {
  let nights: Awaited<ReturnType<typeof prisma.leagueNight.findMany<{ include: { season: { select: { id: true; name: true } }; registrations: { select: { id: true } } } }>>>;
  try {
    nights = await prisma.leagueNight.findMany({
      orderBy: { date: "desc" },
      include: {
        season: { select: { id: true, name: true } },
        registrations: { select: { id: true } },
      },
    });
  } catch { return DB_DOWN; }

  const openNight   = nights.find((n) => n.status === "registration_open");
  const inProgress  = nights.find((n) => n.status === "in_progress");
  const completed   = nights.filter((n) => n.status === "completed");

  const bySeason = new Map<string, { seasonName: string; nights: typeof completed }>();
  for (const n of completed) {
    if (!bySeason.has(n.season.id)) bySeason.set(n.season.id, { seasonName: n.season.name, nights: [] });
    bySeason.get(n.season.id)!.nights.push(n);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Weekly Competition
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        Friday Night League
      </h1>
      <p className="reveal stagger-2 text-base mb-10" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Weekly round-robin league open to all club members. Sign up when registration opens, play for your rating.
      </p>

      {/* Open registration */}
      {openNight && (
        <div
          className="reveal glass glass-hover p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: "rgba(179,163,105,0.45)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>
              Registration Open
            </p>
            <p className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              {new Date(openNight.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {openNight.registrations.length} / 32 signed up
            </p>
          </div>
          <Link href={`/league/${openNight.id}/register`} className="btn-gold shrink-0">
            Sign Up →
          </Link>
        </div>
      )}

      {/* In progress */}
      {inProgress && !openNight && (
        <div className="reveal glass glass-hover p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#93c5fd" }}>League In Progress</p>
            <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              {new Date(inProgress.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href={`/league/${inProgress.id}/scores`} className="btn-glass text-sm shrink-0">
            Enter Scores →
          </Link>
        </div>
      )}

      {/* No active night */}
      {!openNight && !inProgress && (
        <div className="reveal glass-sm p-5 mb-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          No league night currently scheduled. Watch Discord for the sign-up form.
        </div>
      )}

      {/* How it works */}
      <div className="reveal glass p-6 mb-14">
        <h2 className="display text-lg mb-3" style={{ color: "var(--gt-gold)" }}>How the League Works</h2>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
          Players are placed into <strong style={{ color: "var(--text-primary)" }}>round-robin groups of 3–6</strong>{" "}
          based on current rating. Each player plays one match against every other player in their group.
          Match results update ratings using the <strong style={{ color: "var(--text-primary)" }}>USATT formula</strong>.
        </p>
        <ul className="space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          {[
            "Sessions capped at 32 players — first come, first served",
            "Sign up via the button above when registration opens",
            "If you signed up but can't make it, notify leadership on Discord",
            "No experience required — all skill levels welcome",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span style={{ color: "var(--gt-gold)" }}>·</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Past results */}
      {bySeason.size > 0 && (
        <div>
          <h2 className="reveal display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>Past Results</h2>
          <div className="space-y-8">
            {[...bySeason.values()].map(({ seasonName, nights: sNights }) => (
              <div key={seasonName}>
                <p className="reveal text-xs uppercase tracking-[0.12em] mb-3" style={{ color: "var(--gt-gold)" }}>
                  {seasonName}
                </p>
                <ul className="space-y-2">
                  {sNights.map((n, i) => (
                    <li key={n.id}>
                      <Link
                        href={`/results/${n.id}`}
                        className={`reveal stagger-${(i % 4) + 1} glass glass-hover p-4 flex items-center justify-between block`}
                      >
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {new Date(n.date).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Results →</span>
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
