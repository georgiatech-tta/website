import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const barlowSC = Barlow_Semi_Condensed({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: { default: "GT Table Tennis Association", template: "%s | GTTTA" },
  description: "Georgia Tech Table Tennis Association — practice, leagues, and ratings.",
  keywords: ["table tennis", "Georgia Tech", "GT", "ping pong", "GTTTA"],
  openGraph: {
    siteName: "GT Table Tennis Association",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${barlowSC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
