"use client";

import { useState, useEffect } from "react";

interface Exception {
  id: string;
  date: Date;
  reason: string;
}

export default function ExceptionBanner({ exceptions }: { exceptions: Exception[] }) {
  const [visible, setVisible] = useState<Exception[]>([]);

  useEffect(() => {
    setVisible(
      exceptions.filter((e) => !sessionStorage.getItem(`dismissed-exception-${e.id}`))
    );
  }, [exceptions]);

  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    sessionStorage.setItem(`dismissed-exception-${id}`, "1");
    setVisible((v) => v.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mb-6 flex flex-col gap-2">
      {visible.map((e) => (
        <div
          key={e.id}
          className="glass flex items-center gap-3 px-4 py-3 text-sm"
          style={{ borderLeft: "3px solid var(--gt-gold)" }}
        >
          <span style={{ color: "var(--gt-gold)" }}>⚠</span>
          <span style={{ color: "var(--text-secondary)" }}>
            Practice cancelled{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {new Date(e.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>{" "}
            — {e.reason}
          </span>
          <button
            onClick={() => dismiss(e.id)}
            className="ml-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
