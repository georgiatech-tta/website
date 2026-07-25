import { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://gttta.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/schedule", "/rankings", "/results", "/news", "/gallery", "/tournaments", "/about", "/resources"];
  return staticRoutes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
}
