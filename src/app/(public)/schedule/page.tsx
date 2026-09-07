import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Schedule | GT Table Tennis" };

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const typeBadge: Record<string, string> = {
  league: "bg-[var(--gt-gold)] text-[var(--gt-navy)]",
  training: "bg-blue-100 text-blue-800",
  casual: "bg-green-100 text-green-800",
};

export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [schedule, exceptions] = await Promise.all([
    prisma.scheduleEntry.findMany({ where: { active: true }, orderBy: { dayOfWeek: "asc" } }),
    prisma.scheduleException.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Weekly Schedule</h1>
      <p className="text-gray-500 mb-8">Recurring practice times this semester.</p>

      {schedule.length === 0 ? (
        <p className="text-gray-500">Schedule not posted yet — check back soon.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-[var(--gt-navy)] text-white text-left">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-[var(--gt-light)]"}>
                  <td className="px-4 py-3 font-medium text-[var(--gt-navy)]">{days[s.dayOfWeek]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{s.startTime} – {s.endTime}</td>
                  <td className="px-4 py-3">{s.location}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeBadge[s.type] ?? "bg-gray-100 text-gray-700"}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-4">Upcoming Exceptions</h2>
        {exceptions.length === 0 ? (
          <p className="text-gray-500 italic">No exceptions this semester.</p>
        ) : (
          <ul className="space-y-3">
            {exceptions.map((e) => (
              <li key={e.id} className="flex items-start gap-4 border rounded-xl p-4 bg-white">
                <span className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${e.cancelled ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {e.cancelled ? "Cancelled" : "Changed"}
                </span>
                <div>
                  <p className="font-medium text-[var(--gt-navy)]">
                    {new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-gray-600">{e.reason}</p>
                  {e.notes && <p className="text-sm text-gray-400 mt-0.5">{e.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Google Calendar */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--gt-navy)]">Club Calendar</h2>
          {/* ponytail: placeholder until GTTTA shares their public calendar embed URL */}
          <span className="text-xs text-gray-400 italic">Google Calendar coming soon</span>
        </div>
        <div className="border rounded-xl bg-[var(--gt-light)] p-8 text-center text-gray-500 text-sm">
          <p>The GTTTA Google Calendar will be embedded here.</p>
          <p className="mt-1 text-xs text-gray-400">Contact the Webmaster to set up the public calendar link.</p>
        </div>
      </div>
    </div>
  );
}
