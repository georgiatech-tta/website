"use client";

import { useState } from "react";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  nctta: { label: "NCTTA", color: "#4f8ef7" },
  usatt: { label: "USATT", color: "#B3A369" },
  local: { label: "Local", color: "#6fbd87" },
  other: { label: "Other", color: "#8b8b8b" },
};

interface Tournament {
  id: string;
  name: string;
  date: Date;
  type: string;
  location: string | null;
  url: string | null;
  description: string | null;
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.other;
}

export default function TournamentGrid({ tournaments }: { tournaments: Tournament[] }) {
  const [filter, setFilter] = useState("all");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const types = ["all", ...Array.from(new Set(tournaments.map((t) => t.type)))];
  const filtered = filter === "all" ? tournaments : tournaments.filter((t) => t.type === filter);
  const upcoming = filtered.filter((t) => new Date(t.date) >= today).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const past = filtered.filter((t) => new Date(t.date) < today).sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const activeColor = filter !== "all" ? getTypeConfig(filter).color : "var(--gt-gold)";

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {types.map((t) => {
          const cfg = t === "all" ? null : getTypeConfig(t);
          const isActive = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{
                border: `1px solid ${isActive ? (cfg?.color ?? "var(--gt-gold)") : "var(--glass-border)"}`,
                color: isActive ? (cfg?.color ?? "var(--gt-gold)") : "var(--text-muted)",
                background: isActive ? `${cfg?.color ?? "var(--gt-gold)"}18` : "transparent",
              }}
            >
              {t === "all" ? "All" : cfg?.label ?? t}
            </button>
          );
        })}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] mb-4" style={{ color: activeColor }}>Upcoming</p>
          <div className="space-y-3">
            {upcoming.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} isPast={false} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <details className="glass" style={{ borderRadius: "var(--r-md)" }}>
          <summary className="px-5 py-4 font-semibold cursor-pointer select-none list-none flex items-center justify-between" style={{ color: "var(--text-primary)" }}>
            <span>Past Tournaments ({past.length})</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>expand</span>
          </summary>
          <div className="px-5 pb-5 space-y-3">
            {past.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} isPast />
            ))}
          </div>
        </details>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>No tournaments match this filter.</p>
      )}
    </div>
  );
}

function TournamentCard({ tournament: t, index, isPast }: { tournament: Tournament; index: number; isPast: boolean }) {
  const cfg = getTypeConfig(t.type);
  return (
    <div
      className={`reveal stagger-${(index % 4) + 1} glass glass-hover p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative`}
      style={{ opacity: isPast ? 0.65 : 1 }}
    >
      {/* Type badge */}
      <span
        className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
      >
        {isPast ? "Past · " : ""}{cfg.label}
      </span>

      <div className="pr-20">
        <p className="card-title font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {new Date(t.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
          {t.location ? ` · ${t.location}` : ""}
        </p>
      </div>
      {t.url && (
        <a href={t.url} target="_blank" rel="noopener noreferrer" className="btn-glass text-xs shrink-0">
          Details →
        </a>
      )}
    </div>
  );
}
