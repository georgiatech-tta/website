import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const night = await (prisma.leagueNight as any).findFirst({ where: { isTryout: true }, select: { id: true } });
  if (!night) { console.log("No tryout night found"); return; }

  const result = await prisma.match.updateMany({
    where: {
      group: { leagueNightId: night.id },
      status: { not: "pending_entry" },
    },
    data: {
      status: "pending_entry",
      scoreP1: null,
      scoreP2: null,
      winnerId: null,
      submittedAt: null,
      rejectionReason: null,
      submittedByEmail: null,
    },
  });

  console.log(`Reset ${result.count} matches to pending_entry`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
