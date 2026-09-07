import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["700", "800"] });

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
