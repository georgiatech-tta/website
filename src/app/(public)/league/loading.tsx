const pulse = (cls: string) => (
  <div className={`animate-pulse rounded ${cls}`} style={{ background: "rgba(255,255,255,0.08)" }} />
);

export default function LeagueLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col gap-6">
      <div className="glass p-6 flex flex-col gap-3">
        {pulse("h-4 w-32")}
        {pulse("h-6 w-1/2")}
        {pulse("h-4 w-1/3")}
      </div>
      <div className="glass p-6 flex flex-col gap-4">
        {pulse("h-4 w-24")}
        {pulse("h-10 w-full")}
        {pulse("h-10 w-full")}
        {pulse("h-10 w-1/2")}
      </div>
    </div>
  );
}
