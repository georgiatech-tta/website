"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Double rAF: lets React commit new page content + browser paint before querying
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const targets = root.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-right");
        targets.forEach((el) => el.classList.remove("visible"));

        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        targets.forEach((el) => observer.observe(el));
        // Store observer for cleanup
        (root as HTMLElement & { _revealObserver?: IntersectionObserver })._revealObserver?.disconnect();
        (root as HTMLElement & { _revealObserver?: IntersectionObserver })._revealObserver = observer;
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      (root as HTMLElement & { _revealObserver?: IntersectionObserver })._revealObserver?.disconnect();
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
