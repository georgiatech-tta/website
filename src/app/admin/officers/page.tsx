import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default async function AdminOfficersPage() {
  const officers = await prisma.officer.findMany({ orderBy: { order: "asc" } });

  async function add(fd: FormData) {
    "use server";
    await prisma.officer.create({
      data: {
        name: fd.get("name") as string,
        role: fd.get("role") as string,
        email: fd.get("email") as string,
        order: officers.length,
      },
    });
    revalidatePath("/admin/officers");
    revalidatePath("/about");
  }

  async function remove(fd: FormData) {
    "use server";
    await prisma.officer.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/officers");
    revalidatePath("/about");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Officers</h1>
      <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium">+ Add Officer</summary>
        <form action={add} className="mt-3 flex flex-wrap gap-3">
          <input name="name" required placeholder="Name" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-36" />
          <input name="role" required placeholder="Role (e.g. President)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-36" />
          <input name="email" type="email" required placeholder="Email" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40" />
          <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
      </details>
      <div className="bg-white rounded-xl border divide-y">
        {officers.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-medium">{o.name}</span>
              <span className="text-gray-500 ml-2">{o.role}</span>
              <span className="text-gray-400 ml-2">{o.email}</span>
            </div>
            <form action={remove}>
              <input type="hidden" name="id" value={o.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
