import { prisma } from "@/lib/db";
import { RegistrationForm } from "./RegistrationForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ nightId: string }>;
}) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: { season: true },
  });

  if (!night || night.status !== "registration_open") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <p className="text-gray-500 text-lg">Registration is closed for this night.</p>
      </div>
    );
  }

  const [players, registrations] = await Promise.all([
    prisma.player.findMany({
      where: { active: true },
      select: { id: true, name: true, leagueRating: true },
      orderBy: { name: "asc" },
    }),
    prisma.leagueNightRegistration.findMany({
      where: { leagueNightId: nightId },
      orderBy: { createdAt: "desc" },
      include: { player: { select: { name: true } } },
    }),
  ]);

  const formattedDate = new Date(night.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Register for League Night</h1>
        <p className="text-gray-500 mt-1">{formattedDate} · {night.season.name}</p>
      </div>

      <RegistrationForm nightId={nightId} nightDate={formattedDate} players={players} />

      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-[var(--gt-navy)] mb-3">
          Registered ({registrations.length})
        </h2>
        {registrations.length === 0 ? (
          <p className="text-gray-400 text-sm">No registrations yet.</p>
        ) : (
          <ul className="space-y-1">
            {registrations.map((r) => (
              <li key={r.id} className="text-sm text-gray-700">
                {r.player?.name ?? r.guestName}
                {!r.playerId && <span className="ml-2 text-xs text-gray-400">(guest)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
