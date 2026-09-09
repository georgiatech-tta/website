const pulse = (cls: string) => (
  <div className={`animate-pulse rounded ${cls}`} style={{ background: "rgba(255,255,255,0.08)" }} />
);

export default function ResultsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {pulse("h-8 w-40 mb-8")}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass p-5 flex flex-col gap-3">
            {pulse("h-4 w-24")}
            {pulse("h-3 w-full")}
            {pulse("h-3 w-2/3")}
          </div>
        ))}
      </div>
    </div>
  );
}
