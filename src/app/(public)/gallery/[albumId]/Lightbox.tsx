"use client";

import { useState, useCallback, useEffect } from "react";

interface Photo {
  id: string;
  url: string;
  thumbUrl: string | null;
  caption: string | null;
}

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [idx, setIdx] = useState<number | null>(null);

  const close = () => setIdx(null);
  const prev = useCallback(() => setIdx((i) => (i != null ? (i - 1 + photos.length) % photos.length : null)), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i != null ? (i + 1) % photos.length : null)), [photos.length]);

  useEffect(() => {
    if (idx == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [idx, prev, next]);

  // Preload adjacent images
  useEffect(() => {
    if (idx == null) return;
    const preload = (i: number) => { const img = new Image(); img.src = photos[i].url; };
    if (idx > 0) preload(idx - 1);
    if (idx < photos.length - 1) preload(idx + 1);
  }, [idx, photos]);

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIdx(i)}
            className="break-inside-avoid mb-3 w-full block group relative focus:outline-none"
            style={{ borderRadius: "var(--r-md)", overflow: "hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbUrl ?? p.url}
              alt={p.caption ?? ""}
              className="w-full h-auto transition-all duration-300 group-hover:brightness-75 group-hover:scale-[1.02]"
              style={{ display: "block" }}
            />
            {p.caption && (
              <span
                className="absolute bottom-2 left-2 right-2 text-xs px-2 py-1 rounded-full text-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  color: "var(--text-primary)",
                }}
              >
                {p.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {idx != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={close}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[idx].url}
              alt={photos[idx].caption ?? ""}
              className="w-full object-contain rounded-[var(--r-md)]"
              style={{ maxHeight: "80vh" }}
            />
            {photos[idx].caption && (
              <p className="text-center text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
                {photos[idx].caption}
              </p>
            )}
            <button onClick={prev} className="glass-sm absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-lg transition-colors" style={{ color: "var(--text-primary)" }}>‹</button>
            <button onClick={next} className="glass-sm absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-lg transition-colors" style={{ color: "var(--text-primary)" }}>›</button>
            <button onClick={close} className="glass-sm absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>✕</button>
            <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>{idx + 1} / {photos.length}</p>
          </div>
        </div>
      )}
    </>
  );
}
