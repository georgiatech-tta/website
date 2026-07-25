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

function TournamentTable({ tournaments }: { tournaments: { id: string; name: string; date: Date; type: string; location: string | null; url: string | null; description: string | null }[] }) {
  if (tournaments.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--gt-navy)] text-white text-left">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
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
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${typeBadge[t.type] ?? typeBadge.other}`}>
                  {t.type}
                </span>
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

export default async function TournamentsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcoming, past] = await Promise.all([
    prisma.tournament.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } }),
    prisma.tournament.findMany({ where: { date: { lt: today } }, orderBy: { date: "desc" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Tournaments</h1>
      <p className="text-gray-500 mb-8">Upcoming competitions and past results.</p>

      <h2 className="text-xl font-semibold text-[var(--gt-navy)] mb-4">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="text-gray-500 mb-10">No upcoming tournaments scheduled — check back soon!</p>
      ) : (
        <div className="mb-12">
          <TournamentTable tournaments={upcoming} />
        </div>
      )}

      {past.length > 0 && (
        <details className="border rounded-xl">
          <summary className="px-4 py-3 font-semibold text-[var(--gt-navy)] cursor-pointer select-none">
            Past Tournaments ({past.length})
          </summary>
          <div className="p-4 pt-0">
            <TournamentTable tournaments={past} />
          </div>
        </details>
      )}
    </div>
  );
}
