import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminSchedulePage() {
  const [entries, exceptions] = await Promise.all([
    prisma.scheduleEntry.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.scheduleException.findMany({ orderBy: { date: "asc" } }),
  ]);

  async function addEntry(fd: FormData) {
    "use server";
    await prisma.scheduleEntry.create({
      data: {
        dayOfWeek: parseInt(fd.get("dayOfWeek") as string),
        startTime: fd.get("startTime") as string,
        endTime: fd.get("endTime") as string,
        location: fd.get("location") as string,
        type: fd.get("type") as string,
        notes: (fd.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
  }

  async function deleteEntry(fd: FormData) {
    "use server";
    await prisma.scheduleEntry.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
  }

  async function addException(fd: FormData) {
    "use server";
    await prisma.scheduleException.create({
      data: {
        date: new Date(fd.get("date") as string),
        reason: fd.get("reason") as string,
        cancelled: fd.get("cancelled") === "true",
        notes: (fd.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
  }

  async function deleteException(fd: FormData) {
    "use server";
    await prisma.scheduleException.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Schedule</h1>

      {/* Weekly entries */}
      <section>
        <h2 className="font-semibold text-[var(--gt-navy)] mb-3">Weekly Practice Times</h2>
        <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-medium">+ Add Entry</summary>
          <form action={addEntry} className="mt-3 flex flex-wrap gap-3">
            <select name="dayOfWeek" className="border rounded-lg px-3 py-2 text-sm">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <input name="startTime" type="time" required className="border rounded-lg px-3 py-2 text-sm" />
            <input name="endTime" type="time" required className="border rounded-lg px-3 py-2 text-sm" />
            <input name="location" required placeholder="Location" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
            <select name="type" className="border rounded-lg px-3 py-2 text-sm">
              <option value="league">League</option>
              <option value="training">Training</option>
              <option value="casual">Casual</option>
            </select>
            <input name="notes" placeholder="Notes (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
            <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
          </form>
        </details>
        <div className="bg-white rounded-xl border divide-y">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="font-medium">{DAYS[e.dayOfWeek]}</span>
                <span className="text-gray-500 ml-2">{e.startTime}–{e.endTime}</span>
                <span className="text-gray-500 ml-2">{e.location}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize ${e.type === "league" ? "bg-[var(--gt-gold)] text-[var(--gt-navy)]" : e.type === "training" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                  {e.type}
                </span>
              </div>
              <form action={deleteEntry}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Exceptions */}
      <section>
        <h2 className="font-semibold text-[var(--gt-navy)] mb-3">Exceptions (Cancellations / Changes)</h2>
        <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-medium">+ Add Exception</summary>
          <form action={addException} className="mt-3 flex flex-wrap gap-3">
            <input name="date" type="date" required className="border rounded-lg px-3 py-2 text-sm" />
            <input name="reason" required placeholder="Reason (e.g. Spring Break)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
            <select name="cancelled" className="border rounded-lg px-3 py-2 text-sm">
              <option value="true">Cancelled</option>
              <option value="false">Modified</option>
            </select>
            <input name="notes" placeholder="Notes (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
            <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
          </form>
        </details>
        <div className="bg-white rounded-xl border divide-y">
          {exceptions.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No exceptions this semester.</p>}
          {exceptions.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="font-medium">{new Date(ex.date).toLocaleDateString()}</span>
                <span className="text-gray-500 ml-2">{ex.reason}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${ex.cancelled ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {ex.cancelled ? "Cancelled" : "Modified"}
                </span>
              </div>
              <form action={deleteException}>
                <input type="hidden" name="id" value={ex.id} />
                <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
