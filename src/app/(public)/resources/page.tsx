import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Resources | GT Table Tennis" };

const CATEGORY_LABELS: Record<string, string> = {
  equipment:          "Equipment Stores",
  "coaching-general": "Coaching: General",
  "coaching-forehand":"Coaching: Forehand",
  "coaching-backhand":"Coaching: Backhand",
  general:            "Other Resources",
};

const categoryOrder = ["equipment", "coaching-general", "coaching-forehand", "coaching-backhand", "general"];

export default async function ResourcesPage() {
  const links = await prisma.resourceLink.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  const grouped = new Map<string, typeof links>();
  for (const link of links) {
    const cat = link.category ?? "general";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(link);
  }
  const sortedCategories = [...grouped.keys()].sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        Learning Hub
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        Resources
      </h1>
      <p className="reveal stagger-2 text-base mb-12" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Curated links for club members — equipment, coaching videos, and more.
      </p>

      {links.length === 0 ? (
        <div className="reveal glass-sm p-6 text-center" style={{ color: "var(--text-muted)" }}>
          No resources posted yet — check back soon.
        </div>
      ) : (
        <div className="space-y-12">
          {sortedCategories.map((cat) => {
            const catLinks = grouped.get(cat)!;
            const label = CATEGORY_LABELS[cat] ?? cat;
            return (
              <section key={cat} className="reveal">
                <p className="text-xs uppercase tracking-[0.12em] mb-4" style={{ color: "var(--gt-gold)" }}>
                  {label}
                </p>
                <ul className="space-y-3">
                  {catLinks.map((r, i) => (
                    <li
                      key={r.id}
                      className={`reveal stagger-${(i % 4) + 1} glass glass-hover p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                    >
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.title}</p>
                        {r.description && (
                          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{r.description}</p>
                        )}
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glass shrink-0 text-xs"
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
