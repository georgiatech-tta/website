import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `${post.title} | GT Table Tennis` : "Not Found | GT Table Tennis" };
}

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { id, published: true },
  });

  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/news" className="text-sm text-[var(--gt-navy)] underline underline-offset-2 mb-6 inline-block">
        ← All news
      </Link>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="w-full rounded-xl mb-6 max-h-72 object-cover" />
      )}

      <p className="text-sm text-gray-400 mb-1">
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
          : ""}
      </p>
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-6">{post.title}</h1>

      {/* Body is sanitized at write time */}
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </div>
  );
}
