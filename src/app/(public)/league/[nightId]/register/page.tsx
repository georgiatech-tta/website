import { prisma } from "@/lib/db";
import { RegistrationForm } from "./RegistrationForm";

export default async function RegisterPage({ params }: { params: Promise<{ nightId: string }> }) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: { season: true },
  });

  if (!night || night.status !== "registration_open") {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="glass p-10">
          <p className="display text-xl mb-2" style={{ color: "var(--text-primary)" }}>Registration Closed</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sign-ups are not currently open for this night.</p>
        </div>
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
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "var(--gt-gold)" }}>
          {night.season.name}
        </p>
        <h1 className="display text-3xl md:text-4xl mb-1" style={{ color: "var(--text-primary)" }}>
          League Night Sign-Up
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{formattedDate}</p>
      </div>

      <RegistrationForm nightId={nightId} nightDate={formattedDate} players={players} />

      <div className="glass p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Registered ({registrations.length})
        </h2>
        {registrations.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No registrations yet — be the first!</p>
        ) : (
          <ul className="space-y-1.5">
            {registrations.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--gt-gold)", opacity: 0.6 }}
                />
                {r.player?.name ?? r.guestName}
                {!r.playerId && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>(guest)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
