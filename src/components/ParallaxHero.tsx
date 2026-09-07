"use client";

import { useEffect, useRef } from "react";

interface ParallaxHeroProps {
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxHero({ children, className = "" }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Apply parallax to elements with data-parallax-speed attribute
        el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((child) => {
          const speed = parseFloat(child.dataset.parallax ?? "0.2");
          child.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
