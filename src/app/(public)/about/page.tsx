import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "About | GT Table Tennis" };

export default async function AboutPage() {
  const officers = await prisma.officer.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">About Us</h1>
      <p className="text-gray-500 mb-10">
        Georgia Tech Table Tennis Association (GTTTA) is an official GT student organization open to all skill levels.
        Whether you&apos;re a beginner picking up a paddle for the first time or a seasoned competitor, we have a place for you.
        Founded in the early 2000s, the club has grown to host weekly league nights, inter-club tournaments, and NCTTA collegiate matches.
      </p>

      <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-4">Club Officers</h2>
      {officers.length === 0 ? (
        <p className="text-gray-500 mb-10">Officer list coming soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {officers.map((o: { id: string; name: string; role: string; email: string }) => (
            <div key={o.id} className="border rounded-xl p-5 bg-white">
              <p className="font-semibold text-[var(--gt-navy)]">{o.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{o.role}</p>
              <a
                href={`mailto:${o.email}`}
                className="text-sm text-[var(--gt-navy)] underline underline-offset-2 mt-1 inline-block"
              >
                {o.email}
              </a>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Contact &amp; Links</h2>
      <ul className="space-y-2 text-sm text-gray-700">
        <li>
          <span className="font-medium">Email: </span>
          <a href="mailto:gttta@lists.gatech.edu" className="text-[var(--gt-navy)] underline underline-offset-2">
            gttta@lists.gatech.edu
          </a>
        </li>
        <li>
          <span className="font-medium">GT OrgSync: </span>
          <a
            href="https://orgsync.gatech.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--gt-navy)] underline underline-offset-2"
          >
            orgsync.gatech.edu
          </a>
        </li>
      </ul>
    </div>
  );
}
