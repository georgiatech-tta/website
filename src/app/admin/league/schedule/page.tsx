import { prisma } from "@/lib/db";
import { ScheduleNightForm } from "./ScheduleNightForm";

export default async function ScheduleNightPage() {
  const seasons = await prisma.season.findMany({ orderBy: { name: "desc" } });

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-[var(--gt-navy)]">Schedule a Night</h1>
      <ScheduleNightForm seasons={seasons} />
    </div>
  );
}
