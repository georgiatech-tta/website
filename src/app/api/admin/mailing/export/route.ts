export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await prisma.mailingSubscriber.findMany({ where: { active: true }, orderBy: { subscribedAt: "desc" } });

  const rows = [
    ["Email", "Name", "Subscribed"],
    ...subs.map((s) => [s.email, s.name ?? "", new Date(s.subscribedAt).toISOString()]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gttta-mailing-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
