interface PageHeroProps {
  label: string;
  title: string;
  subtitle?: string;
}

export default function PageHero({ label, title, subtitle }: PageHeroProps) {
  return (
    <div className="relative px-4 pt-20 pb-12 text-center overflow-hidden">
      {/* Subtle glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(179,163,105,0.07) 0%, transparent 70%)",
        }}
      />
      <p className="reveal text-xs uppercase tracking-[0.22em] mb-3 relative" style={{ color: "var(--gt-gold)" }}>
        {label}
      </p>
      <h1 className="reveal stagger-1 display text-4xl md:text-5xl mb-3 relative" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="reveal stagger-2 text-base max-w-xl mx-auto relative" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
