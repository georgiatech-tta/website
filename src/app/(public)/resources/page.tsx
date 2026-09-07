import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Resources | GT Table Tennis" };

const CATEGORY_LABELS: Record<string, string> = {
  "equipment":          "Equipment Stores",
  "coaching-general":   "Coaching: General",
  "coaching-forehand":  "Coaching: Forehand",
  "coaching-backhand":  "Coaching: Backhand",
  "general":            "Other Resources",
};

export default async function ResourcesPage() {
  const links = await prisma.resourceLink.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  // Group by category preserving display order
  const categoryOrder = ["equipment", "coaching-general", "coaching-forehand", "coaching-backhand", "general"];
  const grouped = new Map<string, typeof links>();
  for (const link of links) {
    const cat = link.category ?? "general";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(link);
  }
  // Sort categories by defined order, then alphabetically for unknowns
  const sortedCategories = [...grouped.keys()].sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--gt-navy)] mb-2">Resources</h1>
      <p className="text-gray-500 mb-10">Helpful links for club members and newcomers.</p>

      {links.length === 0 ? (
        <p className="text-gray-500">No resources posted yet.</p>
      ) : (
        <div className="space-y-10">
          {sortedCategories.map((cat) => {
            const catLinks = grouped.get(cat)!;
            const label = CATEGORY_LABELS[cat] ?? cat;
            return (
              <section key={cat}>
                <h2 className="text-lg font-bold text-[var(--gt-navy)] mb-4 border-b pb-2">{label}</h2>
                <ul className="space-y-3">
                  {catLinks.map((r) => (
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
