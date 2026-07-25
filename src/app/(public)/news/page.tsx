import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = { title: "News | GT Table Tennis" };

function excerpt(html: string, max = 150) {
  return html.replace(/<[^>]+>/g, "").slice(0, max).trimEnd() + (html.length > max ? "…" : "");
}

export default async function NewsPage() {
  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, body: true, publishedAt: true, imageUrl: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">News &amp; Announcements</h1>
      <p className="text-gray-500 mb-8">Updates from the club.</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No announcements yet — stay tuned!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/news/${p.id}`}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
            >
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-1">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                </p>
                <h2 className="font-semibold text-[var(--gt-navy)] line-clamp-2 mb-2">{p.title}</h2>
                <p className="text-sm text-gray-600 flex-1">{excerpt(p.body)}</p>
                <span className="mt-3 text-xs font-medium text-[var(--gt-navy)] underline underline-offset-2">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
