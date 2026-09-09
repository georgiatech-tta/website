import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const post = await prisma.newsPost.findUnique({ where: { id }, select: { title: true, imageUrl: true } });
    if (!post) return buildMeta("Not Found", "");
    return buildMeta(post.title, "", post.imageUrl ?? undefined);
  } catch { return buildMeta("News", "GT Table Tennis news."); }
}

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post: Awaited<ReturnType<typeof prisma.newsPost.findUnique>> | null = null;
  try { post = await prisma.newsPost.findUnique({ where: { id, published: true } }); } catch {}
  if (!post) notFound();

  const wordCount = post.body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/news"
        className="text-sm transition-colors hover:text-[var(--gt-gold-light)] mb-8 inline-block"
        style={{ color: "var(--gt-gold)" }}
      >
        ← All news
      </Link>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="w-full rounded-[var(--r-md)] mb-8 object-cover"
          style={{ maxHeight: "24rem" }}
        />
      )}

      <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
        {post.publishedAt && (
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </span>
        )}
        <span>·</span>
        <span>{readingTime} min read</span>
      </div>

      <h1 className="display text-3xl md:text-4xl mb-8" style={{ color: "var(--text-primary)" }}>
        {post.title}
      </h1>

      <div className="prose-gttta" dangerouslySetInnerHTML={{ __html: post.body }} />

      <div className="mt-10 pt-6 flex items-center gap-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://gttta.vercel.app/news/${id}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glass text-xs"
        >
          Share on X
        </a>
      </div>
    </div>
  );
}
