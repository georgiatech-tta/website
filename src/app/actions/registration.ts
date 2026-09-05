"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateBrackets } from "@/lib/bracket";
import { revalidatePath } from "next/cache";

export async function createUpcomingNight({
  seasonId,
  date,
}: {
  seasonId: string;
  date: string;
}): Promise<{ id: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const night = await prisma.leagueNight.create({
      data: { date: new Date(date), seasonId, status: "registration_open" },
    });
    await prisma.auditLog.create({
      data: {
        leagueNightId: night.id,
        adminEmail: session.user.email,
        action: "create",
        entityType: "LeagueNight",
        entityId: night.id,
      },
    });
    revalidatePath("/admin/league");
    return { id: night.id };
  } catch (err) {
    console.error(err);
    return { error: "Failed to create night." };
  }
}

export async function registerForNight(
  nightId: string,
  payload: { playerId: string } | { guestName: string; guestEmail?: string }
): Promise<{ success: true } | { error: string }> {
  try {
    const night = await prisma.leagueNight.findUnique({ where: { id: nightId } });
    if (!night || night.status !== "registration_open") return { error: "Registration is closed" };

    if ("playerId" in payload) {
      const player = await prisma.player.findUnique({ where: { id: payload.playerId } });
      if (!player || !player.active) return { error: "Player not found or not active." };
      await prisma.leagueNightRegistration.upsert({
        where: { leagueNightId_playerId: { leagueNightId: nightId, playerId: payload.playerId } },
        update: {},
        create: { leagueNightId: nightId, playerId: payload.playerId },
      });
    } else {
      await prisma.leagueNightRegistration.create({
        data: {
          leagueNightId: nightId,
          guestName: payload.guestName,
          guestEmail: payload.guestEmail ?? null,
        },
      });
    }

    revalidatePath(`/league/${nightId}/register`);
    revalidatePath(`/admin/league/${nightId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to register." };
  }
}

export async function generateBracket(
  nightId: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const night = await prisma.leagueNight.findUnique({
      where: { id: nightId },
      include: { registrations: { include: { player: true } } },
    });
    if (!night) return { error: "Night not found." };

    // ponytail: GroupEntry/Match require real player IDs; guests included in bracket but not in DB entries
    const bracketPlayers = night.registrations.map((r) => ({
      id: r.playerId ?? r.id, // use playerId if roster, else registration id as placeholder
      name: r.player?.name ?? r.guestName ?? "Guest",
      rating: r.player?.leagueRating ?? 500,
      playerId: r.playerId,
    }));

    const groups = generateBrackets(
      bracketPlayers.map((p) => ({ id: p.id, name: p.name, rating: p.rating }))
    );

    await prisma.$transaction(async (tx) => {
      for (let gi = 0; gi < groups.length; gi++) {
        const group = await tx.group.create({
          data: { leagueNightId: nightId, tableNumber: gi + 1 },
        });

        const groupPlayers = groups[gi].players.map((bp) => {
          return bracketPlayers.find((p) => p.id === bp.id)!;
        });

        // Only roster players get GroupEntry (schema requires non-null playerId)
        const rosterPlayers = groupPlayers.filter((p) => p.playerId);
        if (rosterPlayers.length > 0) {
          await tx.groupEntry.createMany({
            data: rosterPlayers.map((p) => ({
              groupId: group.id,
              playerId: p.playerId!,
              ratingBefore: p.rating,
            })),
          });
        }

        // Round-robin matches: only between roster players (Match also uses real player IDs)
        for (let i = 0; i < rosterPlayers.length; i++) {
          for (let j = i + 1; j < rosterPlayers.length; j++) {
            await tx.match.create({
              data: {
                groupId: group.id,
                player1Id: rosterPlayers[i].playerId!,
                player2Id: rosterPlayers[j].playerId!,
                status: "pending_entry",
                scoreP1: null,
                scoreP2: null,
                winnerId: null,
              },
            });
          }
        }
      }

      await tx.leagueNight.update({
        where: { id: nightId },
        data: { status: "in_progress" },
      });
    });

    revalidatePath(`/admin/league/${nightId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to generate bracket." };
  }
}

export async function removeRegistration(
  registrationId: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const reg = await prisma.leagueNightRegistration.findUnique({
      where: { id: registrationId },
      include: { leagueNight: true },
    });
    if (!reg) return { error: "Registration not found." };
    if (reg.leagueNight.status !== "registration_open") return { error: "Registration is closed." };

    await prisma.leagueNightRegistration.delete({ where: { id: registrationId } });
    revalidatePath(`/admin/league/${reg.leagueNightId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to remove registration." };
  }
}
