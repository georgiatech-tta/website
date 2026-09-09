import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";

export const revalidate = 60;
export const metadata = buildMeta("Results", "League night results, group standings, and match scores.");

export default async function ResultsPage() {
  let nights: Awaited<ReturnType<typeof prisma.leagueNight.findMany<{ include: { season: { select: { id: true; name: true } } } }>>> = [];
  try {
    nights = await prisma.leagueNight.findMany({
      orderBy: { date: "desc" },
      include: { season: { select: { id: true, name: true } } },
    });
  } catch {}

  const bySeason = new Map<string, { seasonName: string; nights: typeof nights }>();
  for (const n of nights) {
    const key = n.season.id;
    if (!bySeason.has(key)) bySeason.set(key, { seasonName: n.season.name, nights: [] });
    bySeason.get(key)!.nights.push(n);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Archives
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        League Results
      </h1>
      <p className="reveal stagger-2 text-base mb-10" style={{ color: "var(--text-secondary)" }}>
        Click any session to see group standings and match scores.
      </p>

      {/* Overview callout */}
      <div className="reveal glass p-6 mb-12">
        <h2 className="display text-lg mb-3" style={{ color: "var(--gt-gold)" }}>How the League Works</h2>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
          Players are placed into <strong style={{ color: "var(--text-primary)" }}>round-robin groups of 3–6</strong> based on
          their current rating. Each player plays one match against every other player in their group. Results update ratings via
          the <strong style={{ color: "var(--text-primary)" }}>USATT formula</strong>.
        </p>
        <ul className="space-y-1.5 text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {[
            "Sessions capped at 32 players",
            "Sign up via Discord each week when the form is posted",
            "If you signed up but can't attend, notify leadership on Discord",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span style={{ color: "var(--gt-gold)" }}>·</span> {item}
            </li>
          ))}
        </ul>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Older results?{" "}
          <a
            href="https://tta.gtorg.gatech.edu/league"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "var(--gt-gold)" }}
          >
            View historical archive (2014–2025) →
          </a>
        </p>
      </div>

      {bySeason.size === 0 ? (
        <div className="reveal glass-sm p-8 text-center">
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No results yet</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Check back after our next league night.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {[...bySeason.values()].map(({ seasonName, nights: sNights }) => (
            <div key={seasonName}>
              <p className="reveal text-xs uppercase tracking-[0.12em] mb-4" style={{ color: "var(--gt-gold)" }}>
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
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>View →</span>
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
