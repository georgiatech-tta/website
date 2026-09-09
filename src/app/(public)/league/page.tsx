import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";

export const revalidate = 30;
export const metadata = buildMeta("League", "Fall 2025 tryout schedule and registration for GT Table Tennis.");

// Flip to false when tryouts are over to restore regular league page
const TRYOUTS_ACTIVE = true;

const TRYOUT_DATES = [
  {
    date: "Wednesday, September 17",
    day: "Thursday",
    time: "6 – 8 PM",
    location: "CRC Court 6",
    description: "Round Robin play — groups of 4–5. Top 2 per group advance to Single Elimination.",
  },
  {
    date: "Thursday, September 18",
    day: "Friday",
    time: "4 – 6 PM",
    location: "CRC Court 5",
    description: "Remaining Round Robin games (if needed). Single Elimination bracket begins.",
  },
  {
    date: "Monday, September 22",
    day: "Tuesday",
    time: "6 – 8 PM",
    location: "CRC Court 6",
    description: "Remaining Single Elimination matches + final Round Robin to determine Group A / Group B placements.",
  },
];

const REGISTRATION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSemz-Mb8QfoOJi9yqxv0a7DkWVlz5ridoXmFoevp8yNBiH_hQ/viewform?usp=publish-editor";

const DB_DOWN = (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>Weekly Competition</p>
    <h1 className="display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>Friday Night League</h1>
    <div className="glass-sm p-8 text-center mt-8" style={{ color: "var(--text-muted)" }}>Database temporarily unavailable — check back soon.</div>
  </div>
);

export default async function LeaguePage() {
  if (TRYOUTS_ACTIVE) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
          Fall 2025
        </p>
        <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
          Team Tryouts
        </h1>
        <p className="reveal stagger-2 text-base mb-10" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Tryouts span three dates. You must attend all sessions that apply to your bracket progression.
          Additional information is included in the registration form.
        </p>

        {/* Requirements banner */}
        <div
          className="reveal glass p-5 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: "rgba(239,68,68,0.35)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: "#fca5a5" }}>
              Required before first tryout
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Physicals must be completed and dues must be paid before September 17.{" "}
              <a
                href="https://apps.ideal-logic.com/gtclubsports"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-[var(--gt-gold-light)]"
                style={{ color: "var(--gt-gold)" }}
              >
                Pay dues here →
              </a>
            </p>
          </div>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold shrink-0 text-sm"
          >
            Register for Tryouts →
          </a>
        </div>

        {/* Tryout dates */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {TRYOUT_DATES.map((t, i) => (
            <div
              key={i}
              className={`reveal stagger-${i + 1} glass p-6`}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gt-gold)" }}>
                {t.day}, Sept {["17", "18", "22"][i]}
              </p>
              <p className="font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>{t.time}</p>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{t.location}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{t.description}</p>
            </div>
          ))}
        </div>

        {/* Format explanation */}
        <div className="reveal glass p-6 mb-10">
          <h2 className="display text-lg mb-3" style={{ color: "var(--gt-gold)" }}>How Tryouts Work</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>Round Robin (Sept 17–18):</strong>{" "}
              Players are placed in groups of 4–5. You play every other player in your group.
              The <strong style={{ color: "var(--text-primary)" }}>top 2 from each group</strong> advance to Single Elimination.
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>Single Elimination (Sept 18–22):</strong>{" "}
              Bracket play until one winner remains. Remaining Round Robin results also determine{" "}
              <strong style={{ color: "var(--text-primary)" }}>Group A / Group B</strong> league placements for all players.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="reveal text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Questions? Reach out on Discord or check the registration form for additional details.
          </p>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
          >
            Register for Tryouts →
          </a>
        </div>
      </div>
    );
  }

  // --- Regular league page (TRYOUTS_ACTIVE = false) ---

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

  const openNight  = nights.find((n) => n.status === "registration_open");
  const inProgress = nights.find((n) => n.status === "in_progress");
  const completed  = nights.filter((n) => n.status === "completed");

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

      {openNight && (
        <div
          className="reveal glass glass-hover p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: "rgba(179,163,105,0.45)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>Registration Open</p>
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

      {!openNight && !inProgress && (
        <div className="reveal glass-sm p-5 mb-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          No league night currently scheduled. Watch Discord for the sign-up form.
        </div>
      )}

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
