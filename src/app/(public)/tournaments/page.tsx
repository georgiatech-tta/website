import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Tournaments | GT Table Tennis" };

type Tournament = { id: string; name: string; date: Date; type: string; location: string | null; url: string | null; description: string | null };

function TournamentList({ tournaments }: { tournaments: Tournament[] }) {
  if (tournaments.length === 0) return null;
  return (
    <div className="space-y-3">
      {tournaments.map((t, i) => (
        <div key={t.id} className={`reveal stagger-${(i % 4) + 1} glass glass-hover p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {new Date(t.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
              {t.location ? ` · ${t.location}` : ""}
            </p>
          </div>
          {t.url && (
            <a href={t.url} target="_blank" rel="noopener noreferrer" className="btn-glass text-xs shrink-0">
              Details →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function TournamentsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const all = await prisma.tournament.findMany({ orderBy: { date: "desc" } });
  const upcoming = all.filter((t) => new Date(t.date) >= today);
  const past = all.filter((t) => new Date(t.date) < today);

  const upcomingNctta = upcoming.filter((t) => t.type === "nctta");
  const upcomingUsatt = upcoming.filter((t) => t.type === "usatt");
  const upcomingOther = upcoming.filter((t) => t.type !== "nctta" && t.type !== "usatt");
  const pastNctta = past.filter((t) => t.type === "nctta");
  const pastUsatt = past.filter((t) => t.type === "usatt");
  const pastOther = past.filter((t) => t.type !== "nctta" && t.type !== "usatt");

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Competitions
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-12" style={{ color: "var(--text-primary)" }}>
        Tournaments
      </h1>

      {/* Policy callout */}
      <div className="reveal glass p-6 mb-12 grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>NCTTA</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            GTTTA covers registration fees for all eligible NCTTA tournaments. Individual players may qualify for singles
            through strong performance at Divisionals.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>USATT</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Open to all skill levels — not just collegiate athletes. A{" "}
            <a href="https://www.usatt.org/join" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--gt-gold)" }}>
              USATT membership
            </a>{" "}
            ($25/yr) is required.{" "}
            <a href="https://www.usatt.org/tournaments/upcoming-tournaments" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--gt-gold)" }}>
              Browse by state →
            </a>
          </p>
        </div>
      </div>

      {/* Upcoming */}
      <h2 className="reveal display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>Upcoming</h2>
      {upcoming.length === 0 ? (
        <div className="reveal glass-sm p-6 text-center mb-12" style={{ color: "var(--text-muted)" }}>
          No upcoming tournaments scheduled — check back soon.
        </div>
      ) : (
        <div className="space-y-8 mb-14">
          {upcomingNctta.length > 0 && (
            <div>
              <p className="reveal text-xs uppercase tracking-[0.12em] mb-3" style={{ color: "var(--gt-gold)" }}>NCTTA</p>
              <TournamentList tournaments={upcomingNctta} />
            </div>
          )}
          {upcomingUsatt.length > 0 && (
            <div>
              <p className="reveal text-xs uppercase tracking-[0.12em] mb-3" style={{ color: "var(--gt-gold)" }}>USATT</p>
              <TournamentList tournaments={upcomingUsatt} />
            </div>
          )}
          {upcomingOther.length > 0 && (
            <div>
              <p className="reveal text-xs uppercase tracking-[0.12em] mb-3" style={{ color: "var(--gt-gold)" }}>Other</p>
              <TournamentList tournaments={upcomingOther} />
            </div>
          )}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <details className="reveal glass" style={{ borderRadius: "var(--r-md)" }}>
          <summary
            className="px-5 py-4 font-semibold cursor-pointer select-none list-none flex items-center justify-between"
            style={{ color: "var(--text-primary)" }}
          >
            <span>Past Tournaments ({past.length})</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Click to expand</span>
          </summary>
          <div className="px-5 pb-5 space-y-6">
            {pastNctta.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gt-gold)" }}>NCTTA</p>
                <TournamentList tournaments={pastNctta} />
              </div>
            )}
            {pastUsatt.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gt-gold)" }}>USATT</p>
                <TournamentList tournaments={pastUsatt} />
              </div>
            )}
            {pastOther.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gt-gold)" }}>Other</p>
                <TournamentList tournaments={pastOther} />
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
