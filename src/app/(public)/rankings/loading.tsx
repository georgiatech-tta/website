const bar = (w: string) => (
  <div className="h-4 rounded animate-pulse" style={{ width: w, background: "rgba(255,255,255,0.08)" }} />
);

export default function RankingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="h-8 w-48 rounded mb-8 animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="glass overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
            <div className="w-8 h-8 rounded-full animate-pulse shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
            {bar("40%")}
            <div className="ml-auto flex gap-6">{bar("3rem")}{bar("3rem")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
