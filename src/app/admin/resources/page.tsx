import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default async function AdminResourcesPage() {
  const links = await prisma.resourceLink.findMany({ orderBy: { order: "asc" } });

  async function add(fd: FormData) {
    "use server";
    await prisma.resourceLink.create({
      data: {
        title: fd.get("title") as string,
        url: fd.get("url") as string,
        description: (fd.get("description") as string) || null,
        order: links.length,
      },
    });
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
  }

  async function remove(fd: FormData) {
    "use server";
    await prisma.resourceLink.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Resources &amp; Links</h1>
      <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium">+ Add Link</summary>
        <form action={add} className="mt-3 flex flex-wrap gap-3">
          <input name="title" required placeholder="Title" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-36" />
          <input name="url" type="url" required placeholder="https://…" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48" />
          <input name="description" placeholder="Description (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-full" />
          <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
        </form>
      </details>
      <div className="bg-white rounded-xl border divide-y">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span className="font-medium">{l.title}</span>
              <span className="text-gray-400 ml-2 text-xs">{l.url}</span>
              {l.description && <p className="text-gray-500 text-xs mt-0.5">{l.description}</p>}
            </div>
            <form action={remove}>
              <input type="hidden" name="id" value={l.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
