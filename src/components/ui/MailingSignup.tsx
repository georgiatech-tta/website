"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions/subscribe";

export default function MailingSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await subscribe(email);
      if ("ok" in res) {
        setStatus("ok");
      } else {
        setStatus("error");
        setErrorMsg(res.error === "already subscribed" ? "Already subscribed!" : "Invalid email.");
      }
    });
  };

  if (status === "ok") {
    return (
      <p className="text-sm font-semibold" style={{ color: "var(--gt-gold)" }}>
        You&apos;re in ✓
      </p>
    );
  }

  return (
    <div className={compact ? "" : "glass-sm p-4"}>
      {!compact && (
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gt-gold)" }}>
          Stay in the loop
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@gatech.edu"
          required
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded-[var(--r-sm)] bg-transparent border focus:outline-none"
          style={{
            borderColor: "var(--glass-border)",
            color: "var(--text-primary)",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <button type="submit" disabled={pending} className="btn-gold text-sm py-2 px-4 shrink-0">
          {pending ? "…" : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs mt-2" style={{ color: "#f87171" }}>{errorMsg}</p>
      )}
    </div>
  );
}
