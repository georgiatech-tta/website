import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = { title: "Gallery | GT Table Tennis" };

export default async function GalleryPage() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Gallery</h1>
      <p className="text-gray-500 mb-8">Photos from practices, tournaments, and club events.</p>

      {albums.length === 0 ? (
        <p className="text-gray-500">No albums yet — check back after our next event!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/gallery/${a.id}`}
              className="border rounded-xl overflow-hidden bg-white hover:shadow-md transition group"
            >
              {a.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.coverUrl} alt={a.name} className="h-44 w-full object-cover group-hover:brightness-95 transition" />
              ) : (
                <div className="h-44 w-full bg-[var(--gt-light)] flex items-center justify-center text-gray-300 text-4xl">📷</div>
              )}
              <div className="p-4">
                <p className="font-semibold text-[var(--gt-navy)]">{a.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">{a._count.photos} photo{a._count.photos !== 1 ? "s" : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
