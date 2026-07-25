import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { date: "asc" } });

  async function add(fd: FormData) {
    "use server";
    await prisma.tournament.create({
      data: {
        name: fd.get("name") as string,
        date: new Date(fd.get("date") as string),
        location: (fd.get("location") as string) || null,
        url: (fd.get("url") as string) || null,
        description: (fd.get("description") as string) || null,
        type: fd.get("type") as string,
      },
    });
    revalidatePath("/admin/tournaments");
    revalidatePath("/tournaments");
  }

  async function remove(fd: FormData) {
    "use server";
    await prisma.tournament.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/tournaments");
    revalidatePath("/tournaments");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Tournaments</h1>
      <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium">+ Add Tournament</summary>
        <form action={add} className="mt-3 flex flex-wrap gap-3">
          <input name="name" required placeholder="Tournament name" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48" />
          <input name="date" type="date" required className="border rounded-lg px-3 py-2 text-sm" />
          <select name="type" className="border rounded-lg px-3 py-2 text-sm">
            <option value="nctta">NCTTA</option>
            <option value="usatt">USATT</option>
            <option value="local">Local</option>
            <option value="other">Other</option>
          </select>
          <input name="location" placeholder="Location" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <input name="url" type="url" placeholder="Link (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <input name="description" placeholder="Description (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-full" />
          <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
      </details>
      <div className="bg-white rounded-xl border divide-y">
        {tournaments.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-medium">{t.name}</span>
              <span className="text-gray-500 ml-2">{new Date(t.date).toLocaleDateString()}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full uppercase ${t.type === "nctta" ? "bg-[var(--gt-gold)] text-[var(--gt-navy)]" : "bg-gray-100 text-gray-600"}`}>
                {t.type}
              </span>
            </div>
            <form action={remove}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
