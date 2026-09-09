"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [pinged, setPinged] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const show = window.scrollY > 400;
      setVisible(show);
      if (show && !pinged) setPinged(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pinged]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="glass-sm fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
        color: "var(--gt-gold)",
      }}
    >
      {/* ping ring on first appearance */}
      {pinged && (
        <span
          className="absolute inset-0 rounded-[var(--r-sm)]"
          style={{
            animation: "ping-once 600ms var(--ease-enter) forwards",
            background: "rgba(179,163,105,0.25)",
          }}
          onAnimationEnd={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 10 8 4 14 10" />
      </svg>
    </button>
  );
}
