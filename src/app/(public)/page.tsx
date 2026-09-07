import { prisma } from "@/lib/db";
import Link from "next/link";
import ParallaxHero from "@/components/ParallaxHero";

export const revalidate = 60;

export default async function HomePage() {
  const [news, schedule, openNight] = await Promise.all([
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.scheduleEntry.findMany({
      where: { active: true },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.leagueNight.findFirst({
      where: { status: "registration_open" },
      include: { registrations: { select: { id: true } } },
    }),
  ]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* ── Hero ── */}
      <ParallaxHero className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Ambient orbs */}
        <div
          data-parallax="-0.08"
          className="absolute top-1/4 left-1/5 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(179,163,105,0.07) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "orb-drift-a 30s ease-in-out infinite",
          }}
        />
        <div
          data-parallax="-0.05"
          className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,30,60,0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "orb-drift-b 35s ease-in-out infinite",
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <p
            data-parallax="0.05"
            className="reveal text-xs uppercase tracking-[0.22em] mb-5"
            style={{ color: "var(--gt-gold)" }}
          >
            Georgia Institute of Technology
          </p>

          <h1
            data-parallax="0.18"
            className="reveal stagger-1 display text-5xl md:text-7xl mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Georgia Tech{" "}
            <span style={{ color: "var(--gt-gold)" }}>Table Tennis</span>
          </h1>

          <p
            data-parallax="0.1"
            className="reveal stagger-2 text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}
          >
            Competitive league play, weekly practice, and a community built for players who want to improve.
            Open to all GT students — no experience required.
          </p>

          <div className="reveal stagger-3 glass-lg inline-flex flex-col sm:flex-row gap-3 p-3">
            <Link href="/league" className="btn-gold text-sm font-bold">
              Sign Up for League
            </Link>
            <Link href="/schedule" className="btn-glass text-sm">
              View Schedule
            </Link>
            <a
              href="https://discord.gg/xAqGEZdCg7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.919 19.919 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Discord
            </a>
          </div>

          <p className="reveal stagger-4 text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            First visit? You get one free practice before paying dues.
          </p>
        </div>
      </ParallaxHero>

      {/* ── League Registration Banner ── */}
      {openNight && (
        <section className="px-4 pb-6">
          <div className="max-w-4xl mx-auto">
            <div
              className="reveal-left glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
              style={{ borderColor: "rgba(179,163,105,0.4)" }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>
                  Registration Open
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {new Date(openNight.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {openNight.registrations.length} / 32 signed up
                </p>
              </div>
              <Link href={`/league/${openNight.id}/register`} className="btn-gold text-sm shrink-0">
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Schedule ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="reveal-left text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "var(--gt-gold)" }}>
          Practice Times
        </p>
        <h2 className="reveal-left stagger-1 display text-3xl md:text-4xl mb-8" style={{ color: "var(--text-primary)" }}>
          Weekly Schedule
        </h2>

        {schedule.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>Schedule coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {schedule.map((s, i) => (
              <div
                key={s.id}
                className={`${i % 2 === 0 ? "reveal-left" : "reveal-right"} stagger-${i + 1} glass glass-hover p-5`}
              >
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gt-gold)" }}>
                  {days[s.dayOfWeek]}s
                </p>
                <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                  {s.startTime} – {s.endTime}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {s.location}
                </p>
                {s.notes && (
                  <p className="text-xs mt-2" style={{ color: "var(--gt-gold)", opacity: 0.8 }}>
                    {s.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <Link
          href="/schedule"
          className="inline-block mt-6 text-sm transition-colors hover:text-[var(--gt-gold-light)]"
          style={{ color: "var(--gt-gold)" }}
        >
          Full schedule &amp; exceptions →
        </Link>
      </section>

      {/* ── Join ── */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="reveal glass-lg p-8 md:p-12 text-center">
            <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: "var(--gt-gold)" }}>
              Membership
            </p>
            <h2 className="display text-3xl md:text-4xl mb-4" style={{ color: "var(--text-primary)" }}>
              Ready to join?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
              $30/semester dues. Register on Discord, fill out the club form, and show up on Court 6.
              New members get one free practice to try it out first.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://discord.gg/xAqGEZdCg7" target="_blank" rel="noopener noreferrer" className="btn-gold">
                Join Discord
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScSeh1dS0AoFMr1OUQDS8zqZgZzyzqKAC52TbfTs0ca-ywLsg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass"
              >
                Registration Form
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── News ── */}
      {news.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-16">
          <p className="reveal-right text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "var(--gt-gold)" }}>
            Announcements
          </p>
          <h2 className="reveal-right stagger-1 display text-3xl md:text-4xl mb-8" style={{ color: "var(--text-primary)" }}>
            Latest News
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {news.map((post, i) => (
              <Link
                key={post.id}
                href={`/news/${post.id}`}
                className={`${i % 2 === 0 ? "reveal-left" : "reveal-right"} stagger-${i + 1} glass glass-hover p-5 block`}
              >
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                </p>
                <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--text-primary)" }}>
                  {post.title}
                </h3>
                <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                  {post.body.replace(/<[^>]+>/g, "")}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/news"
            className="inline-block mt-6 text-sm transition-colors hover:text-[var(--gt-gold-light)]"
            style={{ color: "var(--gt-gold)" }}
          >
            All news →
          </Link>
        </section>
      )}

      {/* ── Social ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-6">
        <a
          href="https://instagram.com/gt_tabletennis"
          target="_blank"
          rel="noopener noreferrer"
          className="reveal-left glass glass-hover p-8 flex flex-col items-center justify-center gap-4 text-center"
        >
          <svg className="w-10 h-10" style={{ color: "var(--gt-gold)" }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>@gt_tabletennis</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Follow us on Instagram</p>
          </div>
        </a>

        <div className="reveal-right glass overflow-hidden" style={{ aspectRatio: "16/9" }}>
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
