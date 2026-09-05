"use client";

import { createUpcomingNight } from "@/app/actions/registration";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScheduleNightForm({
  seasons,
}: {
  seasons: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId || !date) { setError("All fields required."); return; }
    setLoading(true);
    const result = await createUpcomingNight({ seasonId, date });
    if ("error" in result) { setError(result.error); setLoading(false); return; }
    router.push(`/admin/league/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Season</label>
        <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm" required>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm" required />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="bg-[var(--gt-navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50">
        {loading ? "Creating..." : "Schedule Night"}
      </button>
    </form>
  );
}
