import { prisma } from "@/lib/db";
import PhotoUploader from "@/components/admin/PhotoUploader";
import { notFound } from "next/navigation";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export default async function AdminAlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { photos: { orderBy: { order: "asc" } } },
  });
  if (!album) notFound();

  async function deletePhoto(fd: FormData) {
    "use server";
    await prisma.photo.delete({ where: { id: fd.get("id") as string } });
    revalidatePath(`/admin/gallery/${albumId}`);
    revalidatePath("/gallery");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-1">{album.name}</h1>
      {album.description && <p className="text-gray-500 text-sm mb-4">{album.description}</p>}

      <PhotoUploader albumId={albumId} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
        {album.photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
            <Image src={photo.url} alt={photo.caption ?? ""} width={300} height={200} className="w-full h-40 object-cover" />
            <form action={deletePhoto} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
              <input type="hidden" name="id" value={photo.id} />
              <button type="submit" className="bg-red-500 text-white text-xs px-2 py-0.5 rounded" onClick={(e) => { if (!confirm("Delete photo?")) e.preventDefault(); }}>
                ×
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
