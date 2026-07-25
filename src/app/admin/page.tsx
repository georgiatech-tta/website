import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [playerCount, nightCount, subscriberCount, draftCount] = await Promise.all([
    prisma.player.count({ where: { active: true } }),
    prisma.leagueNight.count(),
    prisma.mailingSubscriber.count({ where: { active: true } }),
    prisma.newsPost.count({ where: { published: false } }),
  ]);

  const cards = [
    { label: "Active Players", value: playerCount, href: "/admin/roster" },
    { label: "League Nights", value: nightCount, href: "/admin/league" },
    { label: "Mailing Subscribers", value: subscriberCount, href: "/admin/mailing" },
    { label: "Draft Posts", value: draftCount, href: "/admin/news" },
  ];

  const quickLinks = [
    { href: "/admin/league/new", label: "Enter League Night Results" },
    { href: "/admin/bracket", label: "Generate Brackets" },
    { href: "/admin/news/new", label: "Write Announcement" },
    { href: "/admin/roster", label: "Manage Roster" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--gt-navy)] mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, href }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border p-5 hover:border-[var(--gt-navy)] transition"
          >
            <p className="text-3xl font-bold text-[var(--gt-navy)]">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-[var(--gt-navy)] mb-3">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {quickLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="bg-[var(--gt-navy)] text-white rounded-lg px-5 py-3 text-sm font-medium hover:brightness-110 transition"
          >
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
