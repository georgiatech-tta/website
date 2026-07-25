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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIdx(i)}
            className="group rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--gt-gold)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumbUrl ?? p.url}
              alt={p.caption ?? ""}
              className="w-full h-32 sm:h-40 object-cover group-hover:brightness-90 transition"
            />
          </button>
        ))}
      </div>

      {idx != null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[idx].url} alt={photos[idx].caption ?? ""} className="w-full max-h-[80vh] object-contain rounded-lg" />
            {photos[idx].caption && (
              <p className="text-white text-center text-sm mt-3">{photos[idx].caption}</p>
            )}
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition text-lg">‹</button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 transition text-lg">›</button>
            <button onClick={close} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition text-sm">✕</button>
          </div>
        </div>
      )}
    </>
  );
}
