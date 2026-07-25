"use client";

import { useState, useRef } from "react";

export default function PhotoUploader({ albumId }: { albumId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setProgress([]);
    for (const file of Array.from(files)) {
      setProgress((p) => [...p, `Uploading ${file.name}…`]);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("albumId", albumId);
      const res = await fetch("/api/admin/gallery/upload", { method: "POST", body: fd });
      if (res.ok) {
        setProgress((p) => [...p.slice(0, -1), `✓ ${file.name}`]);
      } else {
        setProgress((p) => [...p.slice(0, -1), `✗ ${file.name} failed`]);
      }
    }
    setUploading(false);
    window.location.reload();
  }

  return (
    <div
      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[var(--gt-navy)] transition cursor-pointer"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
      />
      {uploading ? (
        <div className="space-y-1">
          {progress.map((p, i) => <p key={i} className="text-sm text-gray-600">{p}</p>)}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm">Drag &amp; drop photos here, or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">Multiple files supported</p>
        </>
      )}
    </div>
  );
}
