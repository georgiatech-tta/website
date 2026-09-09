"use client";

import { useEffect, useRef } from "react";

interface Props {
  data: number[];
  width?: number;
  height?: number;
}

export default function Sparkline({ data, width = 64, height = 24 }: Props) {
  const polyRef = useRef<SVGPolylineElement>(null);

  const trend = data[data.length - 1] > data[0];
  const color = trend ? "#B3A369" : "#f87171";
  const fillColor = trend ? "rgba(179,163,105,0.12)" : "rgba(248,113,113,0.08)";

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = [
    `0,${height}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${width},${height}`,
  ].join(" ");

  const last = points[points.length - 1];

  useEffect(() => {
    const el = polyRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 800ms ease-out";
      el.style.strokeDashoffset = "0";
    });
  }, [data]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", display: "block" }}>
      <polygon points={areaPoints} fill={fillColor} stroke="none" />
      <polyline ref={polyRef} points={linePoints} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={color} />
    </svg>
  );
}
