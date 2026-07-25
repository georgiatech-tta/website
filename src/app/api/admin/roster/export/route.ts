export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const players = await prisma.player.findMany({ orderBy: { leagueRating: "desc" } });

  const rows = [
    ["Name", "Email", "League Rating", "USATT Rating", "Active"],
    ...players.map((p) => [p.name, p.email ?? "", p.leagueRating, p.usattRating ?? "", p.active ? "Yes" : "No"]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gttta-roster-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
