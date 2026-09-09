const pulse = (cls: string) => (
  <div className={`animate-pulse rounded ${cls}`} style={{ background: "rgba(255,255,255,0.08)" }} />
);

export default function TournamentsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {pulse("h-8 w-40 mb-8")}
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass p-5 flex flex-col gap-3">
            {pulse("h-3 w-16")}
            {pulse("h-5 w-3/4")}
            {pulse("h-4 w-1/2")}
          </div>
        ))}
      </div>
    </div>
  );
}
