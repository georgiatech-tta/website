import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminGalleryPage() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  async function createAlbum(fd: FormData) {
    "use server";
    await prisma.album.create({
      data: {
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || null,
      },
    });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
  }

  async function deleteAlbum(fd: FormData) {
    "use server";
    // Cascade deletes photos too (set in Prisma relation)
    await prisma.album.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Gallery</h1>
      <details className="mb-4 bg-[var(--gt-light)] rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium">+ Create Album</summary>
        <form action={createAlbum} className="mt-3 flex flex-wrap gap-3">
          <input name="name" required placeholder="Album name (e.g. Fall 2024)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48" />
          <input name="description" placeholder="Description (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48" />
          <button type="submit" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
        </form>
      </details>
      <p className="text-sm text-gray-500 mb-4">
        After creating an album, click it to upload photos via Vercel Blob.
        Configure <code className="bg-gray-100 px-1 rounded">BLOB_READ_WRITE_TOKEN</code> in your environment first.
      </p>
      <div className="bg-white rounded-xl border divide-y">
        {albums.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No albums yet.</p>}
        {albums.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <Link href={`/admin/gallery/${a.id}`} className="font-medium hover:underline">
              {a.name}
              <span className="text-gray-400 font-normal ml-2">({a._count.photos} photos)</span>
            </Link>
            <form action={deleteAlbum} onSubmit={(e) => { if (!confirm(`Delete album "${a.name}" and all its photos?`)) e.preventDefault(); }}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
