"use server";

import { prisma } from "@/lib/db";

type Result = { ok: true } | { error: string };

export async function subscribe(email: string): Promise<Result> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalid email" };
  try {
    await prisma.mailingSubscriber.create({ data: { email: email.toLowerCase().trim() } });
    return { ok: true };
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") return { error: "already subscribed" };
    throw e;
  }
}
