import Link from "next/link";
import MailingSignup from "@/components/ui/MailingSignup";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: "rgba(0,16,40,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--glass-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p
            className="font-bold text-base mb-1"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--gt-gold)" }}
          >
            GT Table Tennis Association
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Georgia Institute of Technology · Atlanta, GA
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
            NCTTA Georgia Division Champions: 2008–2015 · 2017 · 2023
          </p>
        </div>
        <div className="w-full md:w-64">
          <MailingSignup compact />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {[
            { href: "/schedule", label: "Schedule" },
            { href: "/league", label: "League" },
            { href: "/about", label: "Contact" },
            { href: "/resources", label: "Resources" },
            { href: "/admin", label: "Admin" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-[var(--gt-gold-light)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
