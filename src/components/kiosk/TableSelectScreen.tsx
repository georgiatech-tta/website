"use client";

import Link from "next/link";
import type { KioskGroup } from "./KioskShell";

interface Props {
  groups: KioskGroup[];
  onSelectGroup: (groupId: string) => void;
}

export default function TableSelectScreen({ groups, onSelectGroup }: Props) {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/tryouts" className="text-sm" style={{ color: "var(--gt-gold)" }}>← Home</Link>
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--gt-gold)" }}>
            Kiosk Mode
          </p>
          <div style={{ width: 60 }} />
        </div>
        <h1 className="display text-4xl text-center mb-8" style={{ color: "var(--text-primary)" }}>
          Select Your Table
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => {
            const pending = group.matches.filter((m) => m.status === "pending_entry").length;
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className="glass glass-hover p-6 text-left"
                style={{ minHeight: 120 }}
              >
                <p className="display text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
                  Table {group.tableNumber ?? "—"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {group.entries.length} players
                  {pending > 0 && (
                    <span style={{ color: "var(--gt-gold)" }}> · {pending} pending</span>
                  )}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
