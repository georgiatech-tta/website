import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminNewsPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });

  async function deletePost(fd: FormData) {
    "use server";
    await prisma.newsPost.delete({ where: { id: fd.get("id") as string } });
    revalidatePath("/admin/news");
    revalidatePath("/news");
  }

  async function togglePublish(fd: FormData) {
    "use server";
    const id = fd.get("id") as string;
    const published = fd.get("published") === "true";
    await prisma.newsPost.update({
      where: { id },
      data: { published: !published, publishedAt: !published ? new Date() : null },
    });
    revalidatePath("/admin/news");
    revalidatePath("/news");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--gt-navy)]">News / Announcements</h1>
        <Link href="/admin/news/new" className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition">
          + New Post
        </Link>
      </div>
      <div className="bg-white rounded-xl border divide-y">
        {posts.length === 0 && <p className="px-5 py-4 text-gray-400 text-sm">No posts yet.</p>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <Link href={`/admin/news/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
              <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <form action={togglePublish}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={String(p.published)} />
                <button type="submit" className={`text-xs px-2 py-1 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.published ? "Published" : "Draft"}
                </button>
              </form>
              <form action={deletePost} onSubmit={(e) => { if (!confirm("Delete post?")) e.preventDefault(); }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
