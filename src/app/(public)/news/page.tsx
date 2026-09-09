import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";

export const revalidate = 60;
export const metadata = buildMeta("News", "Latest announcements and news from GT Table Tennis.");

export default async function NewsPage() {
  let posts: Awaited<ReturnType<typeof prisma.newsPost.findMany>> = [];
  try { posts = await prisma.newsPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } }); } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Announcements
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-12" style={{ color: "var(--text-primary)" }}>
        News
      </h1>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No announcements yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className={`reveal stagger-${(i % 5) + 1} glass glass-hover p-5 block`}
            >
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </p>
              <h2 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--text-primary)" }}>
                {post.title}
              </h2>
              <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                {post.body.replace(/<[^>]+>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
