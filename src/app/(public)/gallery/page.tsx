import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

export const revalidate = 60;
export const metadata = buildMeta("Gallery", "Photo albums from GT Table Tennis events and league nights.");

export default async function GalleryPage() {
  let albums: Awaited<ReturnType<typeof prisma.album.findMany<{ include: { _count: { select: { photos: true } } } }>>> = [];
  try {
    albums = await prisma.album.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { photos: true } } } });
  } catch {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Photos
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-10" style={{ color: "var(--text-primary)" }}>
        Gallery
      </h1>

      {albums.length === 0 ? (
        <EmptyState
          icon={<span className="text-2xl">📷</span>}
          title="No albums yet"
          body="Check back after our next event — photos coming soon."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((a, i) => (
            <Link
              key={a.id}
              href={`/gallery/${a.id}`}
              className={`reveal stagger-${(i % 3) + 1} album-card glass glass-hover block overflow-hidden group`}
            >
              {a.coverUrl ? (
                <div className="relative h-44 overflow-hidden">
                  {/* Ghost cards for stacked hover effect */}
                  <div
                    className="album-card-ghost absolute inset-0"
                    style={{ backgroundImage: `url(${a.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(0.6)" }}
                  />
                  <div
                    className="album-card-ghost absolute inset-0"
                    style={{ backgroundImage: `url(${a.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(0.5)" }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverUrl}
                    alt={a.name}
                    className="album-card-cover h-full w-full object-cover transition-transform duration-500"
                  />
                  <span
                    className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", color: "var(--gt-gold)", backdropFilter: "blur(6px)" }}
                  >
                    {a._count.photos} photo{a._count.photos !== 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div
                  className="h-44 flex items-center justify-center text-4xl"
                  style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}
                >
                  📷
                </div>
              )}
              <div className="p-4">
                <p className="card-title font-semibold" style={{ color: "var(--text-primary)" }}>
                  {a.name} <span className="card-arrow text-sm">→</span>
                </p>
                {a.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
