import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Tournaments | GT Table Tennis" };

const typeBadge: Record<string, string> = {
  nctta: "bg-[var(--gt-gold)] text-[var(--gt-navy)]",
  usatt: "bg-blue-100 text-blue-800",
  local: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-700",
};

type Tournament = { id: string; name: string; date: Date; type: string; location: string | null; url: string | null; description: string | null };

function TournamentTable({ tournaments }: { tournaments: Tournament[] }) {
  if (tournaments.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--gt-navy)] text-white text-left">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Info</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((t, i) => (
            <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-[var(--gt-light)]"}>
              <td className="px-4 py-3 font-medium text-[var(--gt-navy)]">{t.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-4 py-3 text-gray-600">{t.location ?? "—"}</td>
              <td className="px-4 py-3">
                {t.url ? (
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-[var(--gt-navy)] underline underline-offset-2 text-xs">
                    Details →
                  </a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-[var(--gt-navy)]">{title}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${badge}`}>{title.split(" ")[0]}</span>
      </div>
      {children}
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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Tournaments</h1>

      {/* Info callout */}
      <div className="bg-[var(--gt-light)] border rounded-xl p-5 mb-10 text-sm text-gray-700 space-y-3">
        <div>
          <p className="font-semibold text-[var(--gt-navy)] mb-1">NCTTA Tournaments</p>
          <p>
            GTTTA covers registration fees for all NCTTA tournaments that eligible members choose to participate in.
            Individual players may also qualify for singles through strong performance at Divisionals.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--gt-navy)] mb-1">USATT Tournaments</p>
          <p>
            Open to all skill levels — not just collegiate players. A{" "}
            <a href="https://www.usatt.org/join" target="_blank" rel="noopener noreferrer" className="text-[var(--gt-navy)] underline underline-offset-2">
              USATT membership
            </a>{" "}
            ($25/year) is required to participate.{" "}
            <a
              href="https://www.usatt.org/tournaments/upcoming-tournaments"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gt-navy)] underline underline-offset-2"
            >
              Browse USATT tournaments by state →
            </a>
          </p>
        </div>
      </div>

      {/* Upcoming */}
      <h2 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="text-gray-500 mb-10">No upcoming tournaments scheduled — check back soon!</p>
      ) : (
        <>
          {upcomingNctta.length > 0 && (
            <Section title="NCTTA Tournaments" badge={typeBadge.nctta}>
              <TournamentTable tournaments={upcomingNctta} />
            </Section>
          )}
          {upcomingUsatt.length > 0 && (
            <Section title="USATT Tournaments" badge={typeBadge.usatt}>
              <TournamentTable tournaments={upcomingUsatt} />
            </Section>
          )}
          {upcomingOther.length > 0 && (
            <Section title="Other Tournaments" badge={typeBadge.other}>
              <TournamentTable tournaments={upcomingOther} />
            </Section>
          )}
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <details className="border rounded-xl">
          <summary className="px-4 py-3 font-semibold text-[var(--gt-navy)] cursor-pointer select-none">
            Past Tournaments ({past.length})
          </summary>
          <div className="p-4 pt-2 space-y-6">
            {pastNctta.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">NCTTA</p>
                <TournamentTable tournaments={pastNctta} />
              </div>
            )}
            {pastUsatt.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">USATT</p>
                <TournamentTable tournaments={pastUsatt} />
              </div>
            )}
            {pastOther.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Other</p>
                <TournamentTable tournaments={pastOther} />
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
