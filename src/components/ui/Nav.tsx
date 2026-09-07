"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/league", label: "League" },
  { href: "/rankings", label: "Rankings" },
  { href: "/news", label: "News" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(0,24,56,0.82)"
          : "rgba(0,24,56,0.45)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderBottom: scrolled
          ? "1px solid rgba(179,163,105,0.18)"
          : "1px solid rgba(179,163,105,0.08)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-bold text-lg tracking-tight"
          style={{ fontFamily: "var(--font-syne, sans-serif)", color: "var(--gt-gold)" }}
        >
          GT Table Tennis
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(href) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-primary)" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-0.5 mb-1.5 transition-all duration-200"
            style={{
              background: "var(--gt-gold)",
              transform: open ? "rotate(45deg) translateY(6px)" : "",
            }}
          />
          <span
            className="block w-5 h-0.5 mb-1.5 transition-all duration-200"
            style={{
              background: "var(--gt-gold)",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all duration-200"
            style={{
              background: "var(--gt-gold)",
              transform: open ? "rotate(-45deg) translateY(-6px)" : "",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0" }}
      >
        <div
          className="px-4 py-3 flex flex-col gap-1"
          style={{
            background: "rgba(0,20,50,0.92)",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href) ? "text-[var(--gt-gold-light)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              style={isActive(href) ? { background: "var(--glass-bg)" } : {}}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
