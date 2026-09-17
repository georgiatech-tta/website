import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PhotoGrid from "./Lightbox";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ albumId: string }> }): Promise<Metadata> {
  const { albumId } = await params;
  try {
    const album = await prisma.album.findUnique({ where: { id: albumId }, select: { name: true } });
    return { title: album ? `${album.name} | Gallery | GT Table Tennis` : "Not Found | GT Table Tennis" };
  } catch { return { title: "Gallery | GT Table Tennis" }; }
}

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  let album: Awaited<ReturnType<typeof prisma.album.findUnique<{ where: { id: string }; include: { photos: { orderBy: { order: "asc" } } } }>>> | null = null;
  try {
    album = await prisma.album.findUnique({ where: { id: albumId }, include: { photos: { orderBy: { order: "asc" } } } });
  } catch {}
  if (!album) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/gallery" className="text-sm underline underline-offset-2 mb-4 inline-block" style={{ color: "var(--gt-gold)" }}>
        ← Gallery
      </Link>
      <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{album.name}</h1>
      {album.description && <p className="mb-6" style={{ color: "var(--text-secondary)" }}>{album.description}</p>}
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{album.photos.length} photo{album.photos.length !== 1 ? "s" : ""}</p>

      {album.photos.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No photos in this album yet.</p>
      ) : (
        <PhotoGrid photos={album.photos} />
      )}
    </div>
  );
}
