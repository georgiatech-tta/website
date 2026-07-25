export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get("file") as File;
  const albumId = fd.get("albumId") as string;

  if (!file || !albumId) return NextResponse.json({ error: "Missing file or albumId" }, { status: 400 });

  const blob = await put(`gallery/${albumId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    contentType: file.type,
  });

  const photo = await prisma.photo.create({
    data: { albumId, url: blob.url, thumbUrl: blob.url },
  });

  // Set as album cover if first photo
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album?.coverUrl) {
    await prisma.album.update({ where: { id: albumId }, data: { coverUrl: blob.url } });
  }

  return NextResponse.json({ id: photo.id, url: blob.url });
}
