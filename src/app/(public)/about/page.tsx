import { prisma } from "@/lib/db";
import { buildMeta } from "@/lib/metadata";

export const revalidate = 60;
export const metadata = buildMeta("About", "Learn about Georgia Tech Table Tennis Club, our officers, and how to join.");

export default async function AboutPage() {
  let officers: Awaited<ReturnType<typeof prisma.officer.findMany>> = [];
  try { officers = await prisma.officer.findMany({ orderBy: { order: "asc" } }); } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <p className="reveal text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--gt-gold)" }}>
        The Club
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
        About Us
      </h1>
      <p className="reveal stagger-2 text-base mb-14 max-w-xl" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Georgia Tech Table Tennis Association — an official GT student organization open to all skill levels since the early 2000s.
      </p>

      {/* Mission */}
      <section className="reveal mb-10">
        <div className="glass p-6 md:p-8">
          <h2 className="display text-xl mb-3" style={{ color: "var(--gt-gold)" }}>Our Mission</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            GTTTA&apos;s mission is to provide an open, friendly, and competitive environment for members of the Georgia Tech
            community to improve and compete in table tennis. New players are always welcome — we especially encourage players
            who are motivated to improve, wish to learn proper technique, or who have previously played competitively.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="reveal mb-10">
        <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Benefits of Membership</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "High-level table tennis 3× per week",
            "Free entry into NCTTA tournaments",
            "Weekly training sessions & league nights",
            "Club equipment: tables, robots, multi-ball buckets",
            "Club-sponsored events & regional competitions",
            "Community of motivated, improvement-focused players",
          ].map((b, i) => (
            <div key={b} className={`reveal stagger-${(i % 5) + 1} glass-sm p-4 flex items-start gap-3`}>
              <span className="shrink-0 text-sm mt-0.5" style={{ color: "var(--gt-gold)" }}>✓</span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment */}
      <section className="reveal mb-10">
        <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Equipment</h2>
        <div className="glass p-6 grid sm:grid-cols-2 gap-4">
          {[
            { label: "Tables", value: "8 Donic Delhi 25 (ITTF Approved)" },
            { label: "Nets", value: "8 Donic Stress net sets" },
            { label: "Barriers", value: "40 Butterfly court barriers" },
            { label: "Balls", value: "Nittaku J-Top Training 40+ & Joola 3-Star 40+" },
            { label: "Training Aids", value: "Newgy 1040 robot, multi-ball buckets, serve trainer" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--gt-gold)", opacity: 0.8 }}>{label}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 italic" style={{ color: "var(--text-muted)" }}>
          Paddles are not provided — members must bring their own.
        </p>
      </section>

      {/* How to Join */}
      <section className="reveal mb-10">
        <h2 className="display text-xl mb-5" style={{ color: "var(--text-primary)" }}>How to Join</h2>
        <div className="space-y-3">
          {[
            {
              n: "1",
              title: "Join the Discord",
              desc: "Primary method of communication for meet times, announcements, and events.",
              link: { href: "https://discord.gg/xAqGEZdCg7", label: "discord.gg/xAqGEZdCg7 →" },
            },
            {
              n: "2",
              title: "Complete Registration",
              desc: "Fill out the club registration form and confirm your Ideal-Logic registration.",
              link: {
                href: "https://docs.google.com/forms/d/e/1FAIpQLScSeh1dS0AoFMr1OUQDS8zqZgZzyzqKAC52TbfTs0ca-ywLsg/viewform",
                label: "Club Registration Form →",
              },
            },
            {
              n: "3",
              title: "Pay Dues",
              desc: "$30/semester. Payment details are posted on Discord. Contact the Finance officer for help.",
              link: null,
            },
          ].map(({ n, title, desc, link }, i) => (
            <div key={n} className={`reveal stagger-${i + 1} glass glass-hover p-5 flex gap-4`}>
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--gt-gold)", color: "var(--gt-navy)" }}
              >
                {n}
              </div>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{title}</p>
                <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                {link && (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-2 hover:text-[var(--gt-gold-light)] transition-colors" style={{ color: "var(--gt-gold)" }}>
                    {link.label}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-4 glass-sm p-4 text-sm" style={{ color: "var(--text-secondary)", borderColor: "rgba(179,163,105,0.35)" }}>
          <strong style={{ color: "var(--text-primary)" }}>New to the club?</strong> Visitors may attend{" "}
          <strong style={{ color: "var(--gt-gold)" }}>1 free practice</strong> before paying dues.
        </div>
      </section>

      {/* Officers */}
      <section className="reveal mb-10">
        <h2 className="display text-xl mb-5" style={{ color: "var(--text-primary)" }}>Club Officers</h2>
        {officers.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>Officer list coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {officers.map((o, i) => (
              <div key={o.id} className={`reveal stagger-${(i % 5) + 1} glass glass-hover p-4`}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{o.name}</p>
                <p className="text-xs mt-0.5 mb-1" style={{ color: "var(--gt-gold)", opacity: 0.85 }}>{o.role}</p>
                {o.email ? (
                  <a href={`mailto:${o.email}`} className="text-xs underline underline-offset-2 hover:text-[var(--gt-gold-light)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                    {o.email}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="reveal glass p-6">
        <h2 className="display text-xl mb-4" style={{ color: "var(--text-primary)" }}>Contact</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Email", href: "mailto:gttta@lists.gatech.edu", text: "gttta@lists.gatech.edu" },
            { label: "Discord", href: "https://discord.gg/xAqGEZdCg7", text: "discord.gg/xAqGEZdCg7" },
            { label: "Instagram", href: "https://instagram.com/gt_tabletennis", text: "@gt_tabletennis" },
          ].map(({ label, href, text }) => (
            <p key={label}>
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{label}: </span>
              <a href={href} target={href.startsWith("mailto") ? "_self" : "_blank"} rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--gt-gold-light)] transition-colors" style={{ color: "var(--gt-gold)" }}>
                {text}
              </a>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
