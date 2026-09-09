import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import ScheduleCardClient from "@/components/ui/ScheduleCardClient";

export const revalidate = 3600;
export const metadata = buildMeta("Schedule", "Practice times and upcoming changes for GT Table Tennis.");


export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [schedule, exceptions] = await Promise.all([
    prisma.scheduleEntry.findMany({ where: { active: true }, orderBy: { dayOfWeek: "asc" } }),
    prisma.scheduleException.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } }),
  ]).catch(() => [[], []]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        When we play
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        Weekly Schedule
      </h1>
      <p className="reveal stagger-2 text-base mb-12" style={{ color: "var(--text-secondary)" }}>
        Recurring practice times this semester — held at the CRC, 4th floor.
      </p>

      {schedule.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Schedule not posted yet — check back soon.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {schedule.map((s, i) => (
              <ScheduleCardClient key={s.id} entry={s} index={i} />
            ))}
          </div>
          <div className="reveal flex flex-wrap gap-3 mb-14">
            <a
              href="/api/calendar/all"
              download="gttta-full-schedule.ics"
              className="btn-glass text-xs"
            >
              ↓ Download full schedule (.ics)
            </a>
          </div>
        </>
      )}

      {/* Exceptions */}
      <div className="reveal mb-14">
        <h2 className="display text-2xl mb-5" style={{ color: "var(--text-primary)" }}>Upcoming Changes</h2>
        {exceptions.length === 0 ? (
          <div className="glass-sm p-5 text-center" style={{ color: "var(--text-muted)" }}>
            No exceptions this semester — all practices are running as scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {exceptions.map((e) => (
              <div key={e.id} className="reveal glass glass-hover p-5 flex items-start gap-4">
                <span
                  className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full mt-0.5"
                  style={
                    e.cancelled
                      ? { background: "rgba(239,68,68,0.15)", color: "#fca5a5" }
                      : { background: "rgba(251,191,36,0.15)", color: "#fde68a" }
                  }
                >
                  {e.cancelled ? "Cancelled" : "Changed"}
                </span>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{e.reason}</p>
                  {e.notes && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{e.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar placeholder */}
      <div className="reveal">
        <div className="flex items-center justify-between mb-4">
          <h2 className="display text-2xl" style={{ color: "var(--text-primary)" }}>Club Calendar</h2>
          <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>Coming soon</span>
        </div>
        <div className="glass p-10 text-center" style={{ color: "var(--text-muted)" }}>
          <p>The GTTTA Google Calendar will be embedded here.</p>
          <p className="text-xs mt-1">Contact the Webmaster to set up the public calendar link.</p>
        </div>
      </div>
    </div>
  );
}
