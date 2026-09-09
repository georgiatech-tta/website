import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function pad(n: number) { return String(n).padStart(2, "0"); }

function toICSDate(d: Date, timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const entry = await prisma.scheduleEntry.findUnique({ where: { id: entryId } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = (entry.dayOfWeek - today.getDay() + 7) % 7 || 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);

  const dtStart = toICSDate(nextDate, entry.startTime);
  const dtEnd = toICSDate(nextDate, entry.endTime);
  const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${DAYS[entry.dayOfWeek]}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GT Table Tennis//EN",
    "BEGIN:VEVENT",
    `UID:gttta-${entry.id}@gttta.vercel.app`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    rrule,
    `SUMMARY:GT Table Tennis — ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`,
    `LOCATION:${entry.location}`,
    entry.notes ? `DESCRIPTION:${entry.notes}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="gttta-${entry.type}.ics"`,
    },
  });
}
