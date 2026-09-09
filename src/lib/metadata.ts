import type { Metadata } from "next";

const BASE_URL = "https://gttta.vercel.app";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;

export function buildMeta(title: string, description: string, image?: string): Metadata {
  const fullTitle = `${title} | GT Table Tennis`;
  const img = image ?? DEFAULT_IMAGE;
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: BASE_URL,
      siteName: "GT Table Tennis",
      images: [{ url: img, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [img],
    },
  };
}
