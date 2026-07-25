import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { applyUsattSync } from "@/lib/usatt-rating";

export default async function RosterPage() {
  const players = await prisma.player.findMany({ orderBy: { leagueRating: "desc" } });

  async function addPlayer(fd: FormData) {
    "use server";
    const name = fd.get("name") as string;
    const email = (fd.get("email") as string) || undefined;
    const rating = parseInt(fd.get("rating") as string) || 500;
    await prisma.player.create({ data: { name, email, leagueRating: rating } });
    revalidatePath("/admin/roster");
  }

  async function syncUsatt(fd: FormData) {
    "use server";
    const id = fd.get("id") as string;
    const usattRating = parseInt(fd.get("usattRating") as string);
    const player = await prisma.player.findUniqueOrThrow({ where: { id } });
    const newRating = applyUsattSync(player.leagueRating, usattRating);
    await prisma.player.update({
      where: { id },
      data: { usattRating, leagueRating: newRating },
    });
    await prisma.ratingHistory.create({
      data: { playerId: id, rating: newRating, source: "usatt_sync", notes: `USATT: ${usattRating}` },
    });
    revalidatePath("/admin/roster");
  }

  async function toggleActive(fd: FormData) {
    "use server";
    const id = fd.get("id") as string;
    const active = fd.get("active") === "true";
    await prisma.player.update({ where: { id }, data: { active: !active } });
    revalidatePath("/admin/roster");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Roster</h1>
        <div className="flex gap-3">
          <a href="/api/admin/roster/export" className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
            Export CSV
          </a>
        </div>
      </div>

      {/* Add player */}
      <details className="mb-6 bg-[var(--gt-light)] rounded-xl p-4">
        <summary className="font-semibold cursor-pointer text-[var(--gt-navy)]">+ Add Player</summary>
        <form action={addPlayer} className="mt-4 flex flex-wrap gap-3">
          <input name="name" required placeholder="Full name" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <input name="email" type="email" placeholder="Email (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <input name="rating" type="number" defaultValue={500} placeholder="Starting rating" className="border rounded-lg px-3 py-2 text-sm w-36" />
          <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition">
            Add
          </button>
        </form>
      </details>

      {/* Player table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">League Rating</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">USATT</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.map((p) => (
              <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-right font-mono">{p.leagueRating}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-500">{p.usattRating ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button type="submit" className={`text-xs px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <details className="relative">
                    <summary className="cursor-pointer text-xs text-blue-600 hover:underline list-none">USATT sync</summary>
                    <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg p-3 z-10 w-48">
                      <form action={syncUsatt} className="flex flex-col gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="usattRating"
                          type="number"
                          placeholder="USATT rating"
                          defaultValue={p.usattRating ?? ""}
                          className="border rounded px-2 py-1 text-sm"
                          required
                        />
                        <p className="text-xs text-gray-500">Only updates league rating if USATT &gt; current.</p>
                        <button type="submit" className="bg-[var(--gt-navy)] text-white text-xs px-3 py-1.5 rounded font-medium">
                          Apply
                        </button>
                      </form>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
