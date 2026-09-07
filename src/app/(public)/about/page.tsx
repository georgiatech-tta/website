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
        Georgia Tech Table Tennis Association (GTTTA) — an official GT student organization open to all skill levels.
      </p>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          GTTTA&apos;s mission is to provide an open, friendly, and competitive environment for members of the Georgia Tech
          community to improve and compete in table tennis. New players are always welcome — we especially encourage players
          who are motivated to improve, wish to learn proper technique, or who have previously played competitively.
          Founded in the early 2000s, the club has grown to host weekly league nights, inter-club tournaments, and NCTTA
          collegiate matches.
        </p>
      </section>

      {/* Benefits */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Benefits of Membership</h2>
        <ul className="space-y-1.5 text-gray-700">
          {[
            "High-level table tennis 3× per week",
            "Free entry into NCTTA tournaments (GTTTA covers registration fees)",
            "Weekly training sessions and league nights",
            "Access to quality club equipment (tables, balls, robots, multi-ball buckets, serve trainer)",
            "Club-sponsored events and participation in regional competitions",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="text-[var(--gt-gold)] font-bold mt-0.5">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Equipment */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Equipment</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Tables", value: "8 Donic Delhi 25 (ITTF Approved)" },
            { label: "Nets", value: "8 Donic Stress net sets" },
            { label: "Barriers", value: "40 Butterfly court barriers" },
            { label: "Balls", value: "Nittaku J-Top Training 40+ & Joola 3-Star 40+" },
            { label: "Training aids", value: "Newgy 1040 robot, multi-ball buckets, adjustable serve trainer" },
          ].map(({ label, value }) => (
            <div key={label} className="border rounded-xl p-4 bg-white">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-gray-700">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3 italic">Note: Paddles are not provided — members must bring their own.</p>
      </section>

      {/* How to Join */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">How to Join</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--gt-navy)] text-[var(--gt-gold)] font-bold flex items-center justify-center text-sm">1</span>
            <div>
              <p className="font-semibold text-[var(--gt-navy)]">Join the Discord</p>
              <p className="text-sm text-gray-600">Primary method of communication for meet times, announcements, and events.</p>
              <a
                href="https://discord.gg/xAqGEZdCg7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-sm text-[var(--gt-navy)] underline underline-offset-2"
              >
                discord.gg/xAqGEZdCg7 →
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--gt-navy)] text-[var(--gt-gold)] font-bold flex items-center justify-center text-sm">2</span>
            <div>
              <p className="font-semibold text-[var(--gt-navy)]">Complete Registration</p>
              <p className="text-sm text-gray-600">Fill out the club registration form and confirm your Ideal-Logic registration.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScSeh1dS0AoFMr1OUQDS8zqZgZzyzqKAC52TbfTs0ca-ywLsg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-sm text-[var(--gt-navy)] underline underline-offset-2"
              >
                Club Registration Form →
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--gt-navy)] text-[var(--gt-gold)] font-bold flex items-center justify-center text-sm">3</span>
            <div>
              <p className="font-semibold text-[var(--gt-navy)]">Pay Dues</p>
              <p className="text-sm text-gray-600">$30/semester. Details on payment are posted in the Discord. Contact the Finance officer for help.</p>
            </div>
          </li>
        </ol>
        <div className="mt-5 bg-[var(--gt-light)] rounded-xl px-5 py-4 text-sm text-gray-700 border">
          <strong>New to the club?</strong> Visitors are welcome to attend <strong>1 free practice</strong> before paying dues to decide if they want to join.
        </div>
      </section>

      {/* Officers */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-4">Club Officers</h2>
        {officers.length === 0 ? (
          <p className="text-gray-500 mb-10">Officer list coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((o) => (
              <div key={o.id} className="border rounded-xl p-5 bg-white">
                <p className="font-semibold text-[var(--gt-navy)]">{o.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{o.role}</p>
                {o.email ? (
                  <a
                    href={`mailto:${o.email}`}
                    className="text-sm text-[var(--gt-navy)] underline underline-offset-2 mt-1 inline-block"
                  >
                    {o.email}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Contact &amp; Links</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <span className="font-medium">Email: </span>
            <a href="mailto:gttta@lists.gatech.edu" className="text-[var(--gt-navy)] underline underline-offset-2">
              gttta@lists.gatech.edu
            </a>
          </li>
          <li>
            <span className="font-medium">Discord: </span>
            <a href="https://discord.gg/xAqGEZdCg7" target="_blank" rel="noopener noreferrer" className="text-[var(--gt-navy)] underline underline-offset-2">
              discord.gg/xAqGEZdCg7
            </a>
          </li>
          <li>
            <span className="font-medium">Instagram: </span>
            <a href="https://instagram.com/gttta_tt" target="_blank" rel="noopener noreferrer" className="text-[var(--gt-navy)] underline underline-offset-2">
              @gttta_tt
            </a>
          </li>
        </ul>
      </section>

      {/* Feedback */}
      <section>
        <h2 className="text-xl font-bold text-[var(--gt-navy)] mb-3">Club Feedback</h2>
        <p className="text-sm text-gray-600">
          Have a suggestion or concern? Talk to any officer during practice, email us, or use the anonymous feedback form (link coming soon).
        </p>
      </section>
    </div>
  );
}
