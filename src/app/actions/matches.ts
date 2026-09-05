"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateGroupRatings } from "@/lib/usatt-rating";
import { revalidatePath } from "next/cache";

export async function submitMatchScore(
  matchId: string,
  data: {
    scoreP1: string;
    scoreP2: string;
    winnerId: string;
    submitterEmail: string;
  }
): Promise<{ success: true } | { error: string }> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { group: { include: { leagueNight: true } } },
    });

    if (!match) return { error: "Match not found" };
    if (!["pending_entry", "rejected"].includes(match.status))
      return { error: "This match is not open for score entry" };
    if (match.group.leagueNight.status !== "in_progress")
      return { error: "Score entry is not open for this league night" };
    if (data.winnerId !== match.player1Id && data.winnerId !== match.player2Id)
      return { error: "Winner must be one of the two players" };

    await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreP1: data.scoreP1,
        scoreP2: data.scoreP2,
        winnerId: data.winnerId,
        status: "pending_approval",
        submittedByEmail: data.submitterEmail || null,
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });

    const nightId = match.group.leagueNightId;
    revalidatePath(`/league/${nightId}/scores`);
    revalidatePath(`/admin/league/${nightId}`);

    return { success: true };
  } catch {
    return { error: "Failed to submit score" };
  }
}

export async function approveMatch(
  matchId: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: "approved" },
      include: { group: true },
    });

    const nightId = match.group.leagueNightId;

    // Check if all matches in night are approved
    const remaining = await prisma.match.count({
      where: {
        group: { leagueNightId: nightId },
        status: { not: "approved" },
      },
    });

    if (remaining === 0) await finalizeNightRatings(nightId);

    revalidatePath(`/admin/league/${nightId}`);
    return { success: true };
  } catch {
    return { error: "Failed to approve match" };
  }
}

export async function rejectMatch(
  matchId: string,
  reason: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: "rejected", rejectionReason: reason },
      include: { group: true },
    });

    const nightId = match.group.leagueNightId;
    revalidatePath(`/admin/league/${nightId}`);
    revalidatePath(`/league/${nightId}/scores`);
    return { success: true };
  } catch {
    return { error: "Failed to reject match" };
  }
}

async function finalizeNightRatings(nightId: string) {
  await prisma.$transaction(async (tx) => {
    const night = await tx.leagueNight.findUnique({
      where: { id: nightId },
      include: {
        groups: {
          include: {
            entries: true,
            matches: { where: { status: "approved", winnerId: { not: null } } },
          },
        },
      },
    });

    if (!night) return;

    for (const group of night.groups) {
      // guests (playerId null) don't have ratings to update
      const entries = group.entries
        .filter((e): e is typeof e & { playerId: string } => e.playerId !== null)
        .map((e) => ({ playerId: e.playerId, ratingBefore: e.ratingBefore }));
      const matches = group.matches.map((m) => ({
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        winnerId: m.winnerId!,
      }));

      const newRatings = calculateGroupRatings(entries, matches);

      for (const entry of group.entries) {
        if (!entry.playerId) continue; // guests have no rating to update
        const newRating = newRatings.get(entry.playerId);
        if (newRating === undefined) continue;

        await tx.player.update({
          where: { id: entry.playerId },
          data: { leagueRating: newRating },
        });

        await tx.ratingHistory.create({
          data: {
            playerId: entry.playerId,
            rating: newRating,
            source: "league",
            notes: `League night ${night.date.toISOString().split("T")[0]}`,
          },
        });

        await tx.groupEntry.update({
          where: { id: entry.id },
          data: { ratingAfter: newRating },
        });
      }
    }

    await tx.leagueNight.update({
      where: { id: nightId },
      data: { status: "completed" },
    });

    await tx.auditLog.create({
      data: {
        action: "create",
        entityType: "LeagueNight",
        entityId: nightId,
        adminEmail: "system",
      },
    });
  });

  revalidatePath("/rankings");
  revalidatePath("/results");
  revalidatePath(`/admin/league/${nightId}`);
}
