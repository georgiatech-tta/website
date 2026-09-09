import type { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

export default function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="glass-sm w-16 h-16 flex items-center justify-center mb-5"
        style={{ color: "var(--text-muted)", borderRadius: "var(--r-md)" }}
      >
        {icon}
      </div>
      <p className="display text-xl mb-2" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
      {cta && (
        <Link href={cta.href} className="btn-glass mt-6 text-sm">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
