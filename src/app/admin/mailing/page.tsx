import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default async function MailingPage() {
  const subscribers = await prisma.mailingSubscriber.findMany({
    where: { active: true },
    orderBy: { subscribedAt: "desc" },
  });

  async function addSubscriber(fd: FormData) {
    "use server";
    const email = (fd.get("email") as string).trim().toLowerCase();
    const name = (fd.get("name") as string).trim() || undefined;
    await prisma.mailingSubscriber.upsert({
      where: { email },
      create: { email, name, active: true },
      update: { active: true, name },
    });
    revalidatePath("/admin/mailing");
  }

  async function bulkAdd(fd: FormData) {
    "use server";
    const raw = fd.get("emails") as string;
    const emails = raw.split(/[\n,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));
    await Promise.all(
      emails.map((email) =>
        prisma.mailingSubscriber.upsert({
          where: { email },
          create: { email, active: true },
          update: { active: true },
        })
      )
    );
    revalidatePath("/admin/mailing");
  }

  async function unsubscribe(fd: FormData) {
    "use server";
    await prisma.mailingSubscriber.update({
      where: { id: fd.get("id") as string },
      data: { active: false },
    });
    revalidatePath("/admin/mailing");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Mailing List ({subscribers.length})</h1>
        <a href="/api/admin/mailing/export" className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
          Export CSV
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3 text-sm">Add Single</h2>
          <form action={addSubscriber} className="flex gap-2">
            <input name="name" placeholder="Name (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1" />
            <input name="email" type="email" required placeholder="Email" className="border rounded-lg px-3 py-2 text-sm flex-1" />
            <button type="submit" className="bg-[var(--gt-navy)] text-white px-3 py-2 rounded-lg text-sm font-medium">Add</button>
          </form>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3 text-sm">Bulk Add (paste emails, one per line or comma-separated)</h2>
          <form action={bulkAdd} className="flex flex-col gap-2">
            <textarea name="emails" rows={4} className="border rounded-lg px-3 py-2 text-sm font-mono" placeholder="alice@gatech.edu&#10;bob@gatech.edu" />
            <button type="submit" className="bg-[var(--gt-navy)] text-white px-3 py-2 rounded-lg text-sm font-medium self-start">Add All</button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Subscribed</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 text-gray-500">{s.name ?? "—"}</td>
                <td className="px-4 py-2 text-gray-400">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <form action={unsubscribe}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
