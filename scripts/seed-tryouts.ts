/**
 * Seeds the Fall 2025 tryout night into the DB.
 * Run once: npx tsx scripts/seed-tryouts.ts
 * Requires DATABASE_URL in .env.local (loaded via dotenv below).
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const GROUPS: { name: string; players: string[] }[] = [
  { name: "Group 1", players: ["Stanley Hsu", "Gautam Pradhan", "Boyuan (Jerry) Yao"] },
  { name: "Group 2", players: ["Mu Du", "Noah Padtha", "Gayatri Tanksali"] },
  { name: "Group 3", players: ["Mehrad Abbaszadeh Minab", "Jayden Lee", "Billy Ho", "Aarush Gupta"] },
  { name: "Group 4", players: ["Kevin Jiao", "Grace Wang", "Jaeeun Lee"] },
  { name: "Group 5", players: ["Johnathan Shih", "Jackson Holley", "Sundar Pranesh Jayapriya Sukumar", "Deep Inder Mohan"] },
  { name: "Group 6", players: ["Roshan Patel", "Joshua Diao", "Sean Matos", "Man To Tam"] },
  { name: "Group 7", players: ["Tobias Wang", "Rishi Motkur", "Zhijing (Claire) Huang", "Helena He"] },
  { name: "Group 8", players: ["Nathan Lee", "Anvit Divekar", "Sungchan Yi", "Nicholas Jankovic"] },
];

async function main() {
  // Require a season to exist; create a tryout-specific one if needed
  let season = await prisma.season.findFirst({ where: { name: "Fall 2025" } });
  if (!season) {
    season = await prisma.season.create({ data: { name: "Fall 2025", startDate: new Date("2026-09-17") } });
    console.log("Created season: Fall 2025");
  }

  // Idempotent: skip if tryout night already exists
  const existing = await prisma.leagueNight.findFirst({ where: { isTryout: true } });
  if (existing) {
    console.log("Tryout night already seeded:", existing.id);
    console.log("Score entry URL: /league/" + existing.id + "/scores");
    await prisma.$disconnect();
    return;
  }

  const night = await prisma.leagueNight.create({
    data: {
      date: new Date("2026-09-17T18:00:00-04:00"),
      seasonId: season.id,
      status: "in_progress",
      isTryout: true,
    },
  });
  console.log("Created tryout night:", night.id);

  for (let gi = 0; gi < GROUPS.length; gi++) {
    const { name, players: playerNames } = GROUPS[gi];

    // Upsert players (by name — tryout players may not have emails yet)
    const playerRecords = await Promise.all(
      playerNames.map((pName) =>
        prisma.player.upsert({
          where: { email: `tryout-${pName.toLowerCase().replace(/\s+/g, "-")}@placeholder.gttta` },
          update: {},
          create: {
            name: pName,
            email: `tryout-${pName.toLowerCase().replace(/\s+/g, "-")}@placeholder.gttta`,
            active: true,
          },
        })
      )
    );

    const group = await prisma.group.create({
      data: {
        leagueNightId: night.id,
        tableNumber: gi + 1,
        entries: {
          create: playerRecords.map((p, idx) => ({
            playerId: p.id,
            ratingBefore: p.leagueRating,
          })),
        },
      },
    });

    // Generate all round-robin match pairs
    const matches: { player1Id: string; player2Id: string }[] = [];
    for (let i = 0; i < playerRecords.length; i++) {
      for (let j = i + 1; j < playerRecords.length; j++) {
        matches.push({ player1Id: playerRecords[i].id, player2Id: playerRecords[j].id });
      }
    }

    await prisma.match.createMany({
      data: matches.map((m) => ({
        groupId: group.id,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        status: "pending_entry",
      })),
    });

    console.log(`  ${name}: ${playerRecords.length} players, ${matches.length} matches`);
  }

  console.log("\nDone! Score entry URL: /league/" + night.id + "/scores");
  console.log("Tryouts page: /tryouts");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
