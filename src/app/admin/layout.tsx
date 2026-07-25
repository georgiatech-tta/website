import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/league", label: "League Entry" },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/bracket", label: "Bracket Generator" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/officers", label: "Officers" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/mailing", label: "Mailing List" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--gt-navy)] text-white flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="font-bold text-[var(--gt-gold)] text-sm">GTTTA Admin</p>
          <p className="text-xs text-white/50 truncate mt-0.5">{session.user?.email}</p>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="text-xs text-white/50 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
