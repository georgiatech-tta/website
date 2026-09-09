import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const pad = (n: number) => String(n).padStart(2, "0");

function toICSDate(d: Date, timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
}

export async function GET() {
  const entries = await prisma.scheduleEntry.findMany({ where: { active: true }, orderBy: { dayOfWeek: "asc" } });
  if (entries.length === 0) return new Response("No schedule entries", { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const vevents = entries.map((entry) => {
    const daysUntil = (entry.dayOfWeek - today.getDay() + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);

    return [
      "BEGIN:VEVENT",
      `UID:gttta-${entry.id}@gttta`,
      `DTSTART:${toICSDate(nextDate, entry.startTime)}`,
      `DTEND:${toICSDate(nextDate, entry.endTime)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${DAYS[entry.dayOfWeek]}`,
      `SUMMARY:GT Table Tennis — ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`,
      `LOCATION:${entry.location}`,
      entry.notes ? `DESCRIPTION:${entry.notes}` : null,
      "END:VEVENT",
    ].filter(Boolean).join("\r\n");
  });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GT Table Tennis//EN",
    "CALSCALE:GREGORIAN",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="gttta-full-schedule.ics"`,
    },
  });
}
