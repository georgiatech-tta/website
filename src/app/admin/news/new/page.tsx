import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export default function NewPostPage() {
  async function createPost(fd: FormData) {
    "use server";
    const session = await auth();
    const post = await prisma.newsPost.create({
      data: {
        title: fd.get("title") as string,
        body: fd.get("body") as string,
        published: fd.get("published") === "on",
        publishedAt: fd.get("published") === "on" ? new Date() : null,
        authorEmail: session?.user?.email ?? "admin",
      },
    });
    redirect(`/admin/news/${post.id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">New Post</h1>
      <form action={createPost} className="space-y-4 bg-white rounded-xl border p-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
          <input name="title" required className="border rounded-lg px-3 py-2 w-full text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Body (HTML allowed)</label>
          <textarea name="body" rows={10} required className="border rounded-lg px-3 py-2 w-full text-sm font-mono" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Publish immediately
        </label>
        <button type="submit" className="bg-[var(--gt-navy)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition">
          Save
        </button>
      </form>
    </div>
  );
}
