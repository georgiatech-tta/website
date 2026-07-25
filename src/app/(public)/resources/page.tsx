import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Resources | GT Table Tennis" };

export default async function ResourcesPage() {
  const links = await prisma.resourceLink.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Resources</h1>
      <p className="text-gray-500 mb-8">Helpful links for club members and newcomers.</p>

      {links.length === 0 ? (
        <p className="text-gray-500">No resources posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {links.map((r) => (
            <li key={r.id} className="border rounded-xl p-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--gt-navy)]">{r.title}</p>
                {r.description && <p className="text-sm text-gray-600 mt-0.5">{r.description}</p>}
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-[var(--gt-navy)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition text-center"
              >
                Open →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
