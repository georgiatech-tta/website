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
              Join a Practice
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

      {/* Schedule snippet */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-[var(--gt-navy)]">Upcoming Practice Times</h2>
        {schedule.length === 0 ? (
          <p className="text-gray-500">Schedule coming soon — check back shortly.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {schedule.map((s) => (
              <div key={s.id} className="border rounded-xl p-4 flex justify-between items-center">
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

      {/* Embeds placeholder row */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
          Instagram feed — add embed once @gttta account is created
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
          YouTube channel — add embed once channel is set up
        </div>
      </section>
    </div>
  );
}
