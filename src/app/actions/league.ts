"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateGroupRatings } from "@/lib/usatt-rating";
import { revalidatePath } from "next/cache";

interface GroupEntry { playerId: string; ratingBefore: number; }
interface MatchRow { player1Id: string; player2Id: string; scoreP1: string; scoreP2: string; winnerId: string; }
interface GroupData { entries: GroupEntry[]; matches: MatchRow[]; }

export async function submitLeagueNight({
  seasonId,
  date,
  groups,
}: {
  seasonId: string;
  date: string;
  groups: GroupData[];
}): Promise<{ id: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const night = await tx.leagueNight.create({
        data: { date: new Date(date), seasonId },
      });

      for (let gi = 0; gi < groups.length; gi++) {
        const { entries, matches } = groups[gi];
        if (entries.length === 0) continue;

        const group = await tx.group.create({
          data: { leagueNightId: night.id, tableNumber: gi + 1 },
        });

        // Create entries with ratingBefore
        await tx.groupEntry.createMany({
          data: entries.map((e) => ({
            groupId: group.id,
            playerId: e.playerId,
            ratingBefore: e.ratingBefore,
          })),
        });

        // Create matches
        const validMatches = matches.filter((m) => m.player1Id && m.player2Id);
        await tx.match.createMany({
          data: validMatches.map((m) => ({
            groupId: group.id,
            player1Id: m.player1Id,
            player2Id: m.player2Id,
            scoreP1: m.scoreP1,
            scoreP2: m.scoreP2,
            winnerId: m.winnerId || null,
          })),
        });

        // Calculate new ratings
        const finalRatings = calculateGroupRatings(entries, validMatches.map((m) => ({
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          winnerId: m.winnerId || null,
        })));

        // Update each player's rating and create rating history
        for (const [playerId, newRating] of finalRatings.entries()) {
          const entry = entries.find((e) => e.playerId === playerId);
          if (!entry || newRating === entry.ratingBefore) continue;

          await tx.player.update({ where: { id: playerId }, data: { leagueRating: newRating } });
          await tx.ratingHistory.create({
            data: {
              playerId,
              rating: newRating,
              source: "league",
              notes: `League night ${new Date(date).toLocaleDateString()}`,
            },
          });
          await tx.groupEntry.updateMany({
            where: { groupId: group.id, playerId },
            data: { ratingAfter: newRating },
          });
        }
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          leagueNightId: night.id,
          adminEmail: session.user!.email!,
          action: "create",
          entityType: "LeagueNight",
          entityId: night.id,
        },
      });

      return night;
    });

    revalidatePath("/rankings");
    revalidatePath("/results");
    revalidatePath("/admin/league");
    return { id: result.id };
  } catch (err) {
    console.error(err);
    return { error: "Failed to save league night. Check logs." };
  }
}
