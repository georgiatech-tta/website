import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PhotoGrid from "./Lightbox";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ albumId: string }> }): Promise<Metadata> {
  const { albumId } = await params;
  const album = await prisma.album.findUnique({ where: { id: albumId }, select: { name: true } });
  return { title: album ? `${album.name} | Gallery | GT Table Tennis` : "Not Found | GT Table Tennis" };
}

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (!album) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/gallery" className="text-sm text-[var(--gt-navy)] underline underline-offset-2 mb-4 inline-block">
        ← Gallery
      </Link>
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-1">{album.name}</h1>
      {album.description && <p className="text-gray-500 mb-6">{album.description}</p>}
      <p className="text-sm text-gray-400 mb-6">{album.photos.length} photo{album.photos.length !== 1 ? "s" : ""}</p>

      {album.photos.length === 0 ? (
        <p className="text-gray-500">No photos in this album yet.</p>
      ) : (
        <PhotoGrid photos={album.photos} />
      )}
    </div>
  );
}
