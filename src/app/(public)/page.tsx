import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const [news, schedule] = await Promise.all([
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.scheduleEntry.findMany({
      where: { active: true },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const typeColor: Record<string, string> = {
    league: "bg-[var(--gt-gold)] text-[var(--gt-navy)]",
    training: "bg-blue-100 text-blue-800",
    casual: "bg-green-100 text-green-800",
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--gt-navy)] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Georgia Tech <span className="text-[var(--gt-gold)]">Table Tennis</span>
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Competitive league play, casual practice, and a welcoming community — open to all GT students.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/schedule"
              className="bg-[var(--gt-gold)] text-[var(--gt-navy)] font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition"
            >
              View Schedule
            </Link>
            <Link
              href="/rankings"
              className="border border-white/40 px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              View Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-[var(--gt-light)] px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--gt-navy)] mb-2">Ready to Join?</h2>
          <p className="text-gray-600 mb-6">
            All GT students are welcome — no experience needed. Visitors get <strong>one free practice</strong> before paying dues.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://discord.gg/xAqGEZdCg7"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.919 19.919 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Join our Discord
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScSeh1dS0AoFMr1OUQDS8zqZgZzyzqKAC52TbfTs0ca-ywLsg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--gt-navy)] text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition"
            >
              Register for the Club
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">Dues: $30/semester · Primary communication via Discord</p>
        </div>
      </section>

      {/* Schedule snippet */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-[var(--gt-navy)]">Upcoming Practice Times</h2>
        {schedule.length === 0 ? (
          <p className="text-gray-500">Schedule coming soon — check back shortly.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {schedule.map((s) => (
              <div key={s.id} className="border rounded-xl p-4 flex justify-between items-center bg-white">
                <div>
                  <p className="font-semibold text-[var(--gt-navy)]">{days[s.dayOfWeek]}s</p>
                  <p className="text-sm text-gray-600">
                    {s.startTime} – {s.endTime}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${typeColor[s.type] ?? "bg-gray-100 text-gray-700"}`}>
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link href="/schedule" className="inline-block mt-4 text-sm text-[var(--gt-navy)] underline underline-offset-2">
          Full schedule &amp; exceptions →
        </Link>
      </section>

      {/* Latest news */}
      <section className="bg-[var(--gt-light)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[var(--gt-navy)]">Latest News</h2>
          {news.length === 0 ? (
            <p className="text-gray-500">No announcements yet.</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {news.map((post) => (
                <Link key={post.id} href={`/news/${post.id}`} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <p className="text-xs text-gray-400 mb-1">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                  </p>
                  <h3 className="font-semibold text-[var(--gt-navy)] line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.body.replace(/<[^>]+>/g, "")}</p>
                </Link>
              ))}
            </div>
          )}
          <Link href="/news" className="inline-block mt-4 text-sm text-[var(--gt-navy)] underline underline-offset-2">
            All news →
          </Link>
        </div>
      </section>

      {/* Social */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
        <a
          href="https://instagram.com/gt_tabletennis"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-3 border rounded-xl p-8 hover:bg-gray-50 transition group"
        >
          <svg className="w-10 h-10 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <div className="text-center">
            <p className="font-semibold text-gray-800">@gt_tabletennis</p>
            <p className="text-sm text-gray-500 mt-1">Follow us on Instagram</p>
          </div>
        </a>

        <div className="rounded-xl overflow-hidden border aspect-video">
          <iframe
            src="https://www.youtube.com/embed?listType=user_uploads&list=GTTTA"
            title="GTTTA YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </section>
    </div>
  );
}
