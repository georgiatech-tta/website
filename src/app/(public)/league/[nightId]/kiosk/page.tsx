import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import KioskShell from "@/components/kiosk/KioskShell";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ nightId: string }>;
}

export default async function KioskPage({ params }: Props) {
  const { nightId } = await params;

  const night = await prisma.leagueNight.findUnique({
    where: { id: nightId },
    include: {
      groups: {
        include: {
          entries: {
            include: { player: { select: { id: true, name: true, leagueRating: true } } },
            orderBy: { ratingBefore: "desc" },
          },
          matches: true,
        },
        orderBy: { tableNumber: "asc" },
      },
    },
  });

  if (!night) notFound();

  return <KioskShell nightId={nightId} groups={night.groups} />;
}
