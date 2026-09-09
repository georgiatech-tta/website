import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";
import TournamentGrid from "./TournamentGrid";

export const revalidate = 3600;
export const metadata = buildMeta("Tournaments", "Upcoming and past table tennis tournaments.");

export default async function TournamentsPage() {
  let tournaments: Awaited<ReturnType<typeof prisma.tournament.findMany>> = [];
  try { tournaments = await prisma.tournament.findMany({ orderBy: { date: "desc" } }); } catch {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Competitions
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-10" style={{ color: "var(--text-primary)" }}>
        Tournaments
      </h1>

      {/* Policy callout */}
      <div className="reveal glass p-6 mb-10 grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>NCTTA</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            GTTTA covers registration fees for all eligible NCTTA tournaments.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>USATT</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Open to all skill levels. A{" "}
            <a href="https://www.usatt.org/join" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--gt-gold)" }}>
              USATT membership
            </a>{" "}
            ($25/yr) is required.
          </p>
        </div>
      </div>

      <TournamentGrid tournaments={tournaments} />
    </div>
  );
}
