"use client";

import { generateBracket, removeRegistration } from "@/app/actions/registration";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateBracketButton({ nightId }: { nightId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    const result = await generateBracket(nightId);
    if ("error" in result) { setError(result.error); setLoading(false); return; }
    router.refresh();
  }

  return (
    <div>
      <button onClick={handle} disabled={loading}
        className="bg-[var(--gt-gold)] text-[var(--gt-navy)] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition disabled:opacity-50">
        {loading ? "Generating..." : "Generate Bracket"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}

export function RemoveButton({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("Remove this registration?")) return;
    setLoading(true);
    await removeRegistration(registrationId);
    router.refresh();
  }

  return (
    <button onClick={handle} disabled={loading}
      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50">
      {loading ? "..." : "Remove"}
    </button>
  );
}
