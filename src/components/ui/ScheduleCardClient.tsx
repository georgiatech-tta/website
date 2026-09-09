"use client";

import { useState, useRef, useEffect } from "react";

const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Entry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  notes?: string | null;
}

const typeBadgeStyle: Record<string, { bg: string; color: string }> = {
  league:   { bg: "rgba(179,163,105,0.2)",  color: "var(--gt-gold-light)" },
  training: { bg: "rgba(96,165,250,0.15)", color: "#93c5fd" },
  casual:   { bg: "rgba(74,222,128,0.15)", color: "#86efac" },
};

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function buildGoogleCalUrl(entry: Entry): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = (entry.dayOfWeek - today.getDay() + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date, t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `GT Table Tennis — ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`,
    dates: `${fmt(next, entry.startTime)}/${fmt(next, entry.endTime)}`,
    location: entry.location,
    recur: `RRULE:FREQ=WEEKLY`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function ScheduleCardClient({ entry, index }: { entry: Entry; index: number }) {
  const [copied, setCopied] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const badge = typeBadgeStyle[entry.type] ?? { bg: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${DAYS_LONG[entry.dayOfWeek]}s ${fmtTime(entry.startTime)}–${fmtTime(entry.endTime)} · ${entry.location}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (!calOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [calOpen]);

  return (
    <div className={`reveal stagger-${index + 1} glass glass-hover p-6 group relative`}>
      {/* Clipboard button */}
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
        style={{ color: copied ? "var(--gt-gold)" : "var(--text-muted)", background: "rgba(255,255,255,0.05)" }}
        title="Copy schedule info"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 7 5.5 10.5 12 4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="8" height="8" rx="1" />
            <path d="M2 10V3a1 1 0 0 1 1-1h7" />
          </svg>
        )}
      </button>

      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gt-gold)" }}>
        {DAYS_LONG[entry.dayOfWeek]}s
      </p>
      <p className="card-title font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
        {fmtTime(entry.startTime)} – {fmtTime(entry.endTime)}
      </p>
      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{entry.location}</p>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
        style={{ background: badge.bg, color: badge.color }}
      >
        {entry.type}
      </span>
      {entry.notes && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{entry.notes}</p>
      )}

      {/* Add to Calendar */}
      <div className="relative mt-4" ref={popoverRef}>
        <button
          onClick={() => setCalOpen((o) => !o)}
          className="text-xs transition-colors"
          style={{ color: calOpen ? "var(--gt-gold)" : "var(--text-muted)" }}
        >
          + Add to calendar
        </button>
        {calOpen && (
          <div
            className="glass-sm absolute top-full left-0 mt-1 py-2 w-44 z-50 flex flex-col"
            style={{ boxShadow: "var(--glass-shadow)" }}
          >
            <a
              href={`/api/calendar/${entry.id}`}
              download
              className="px-4 py-2 text-xs hover:text-[var(--gt-gold)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Download .ics
            </a>
            <a
              href={buildGoogleCalUrl(entry)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs hover:text-[var(--gt-gold)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Google Calendar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
