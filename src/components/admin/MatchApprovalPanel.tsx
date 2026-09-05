"use client";

import { useState } from "react";
import { approveMatch, rejectMatch } from "@/app/actions/matches";

export interface MatchWithPlayers {
  id: string;
  player1Id: string;
  player2Id: string;
  player1: { name: string };
  player2: { name: string };
  scoreP1: string | null;
  scoreP2: string | null;
  winnerId: string | null;
  status: string;
  submittedByEmail: string | null;
  rejectionReason: string | null;
  groupId: string;
  group: { tableNumber: number | null };
}

const STATUS_BADGE: Record<string, string> = {
  pending_entry: "bg-gray-100 text-gray-600",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending_entry: "Pending Entry",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

function MatchRow({ match }: { match: MatchWithPlayers }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const winnerName =
    match.winnerId === match.player1Id
      ? match.player1.name
      : match.winnerId === match.player2Id
      ? match.player2.name
      : null;

  async function handleApprove() {
    setBusy(true);
    const res = await approveMatch(match.id);
    if ("error" in res) setMsg(res.error);
    setBusy(false);
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setBusy(true);
    const res = await rejectMatch(match.id, reason.trim());
    if ("error" in res) setMsg(res.error);
    else setRejectOpen(false);
    setBusy(false);
  }

  return (
    <div className="py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-gray-800">
            {match.player1.name} vs {match.player2.name}
          </p>
          {match.scoreP1 && (
            <p className="text-xs text-gray-500">
              Scores: {match.scoreP1} / {match.scoreP2}
              {winnerName && <> — Winner: {winnerName}</>}
            </p>
          )}
          {match.submittedByEmail && (
            <p className="text-xs text-gray-400">Submitted by: {match.submittedByEmail}</p>
          )}
          {match.status === "rejected" && match.rejectionReason && (
            <p className="text-xs text-red-600">Reason: {match.rejectionReason}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              STATUS_BADGE[match.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {STATUS_LABEL[match.status] ?? match.status}
          </span>

          {match.status === "pending_approval" && (
            <>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectOpen((o) => !o)}
                disabled={busy}
                className="border border-red-500 text-red-500 px-3 py-1 rounded text-sm hover:bg-red-50 transition disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}

          {match.status === "approved" && (
            <span className="text-green-600 text-sm">✓</span>
          )}
        </div>
      </div>

      {rejectOpen && (
        <div className="flex gap-2 items-start flex-wrap">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason"
            className="border rounded px-2 py-1 text-sm flex-1 min-w-48"
          />
          <button
            onClick={handleReject}
            disabled={busy || !reason.trim()}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => setRejectOpen(false)}
            className="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {msg && <p className="text-red-600 text-sm">{msg}</p>}
    </div>
  );
}

export default function MatchApprovalPanel({
  matches,
  nightId: _nightId,
}: {
  matches: MatchWithPlayers[];
  nightId: string;
}) {
  // Group by tableNumber
  const grouped = matches.reduce<Record<string, MatchWithPlayers[]>>((acc, m) => {
    const key = String(m.group.tableNumber ?? "?");
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  const tables = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <div key={table} className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-[var(--gt-navy)] mb-3">Table {table}</h3>
          <div className="divide-y">
            {grouped[table].map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
