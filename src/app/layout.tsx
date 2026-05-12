import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Personal Game Space`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "A personal game space for showcasing and playing only the games created by you.",
  keywords: [
    "personal games",
    "indie games",
    "game portfolio",
    "creator-owned games",
    siteConfig.name,
  ],
  openGraph: {
    title: `${siteConfig.name} | Personal Game Space`,
    description:
      "Explore a private collection of games made by you, for your own game world only.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Personal Game Space`,
    description:
      "A creator-owned game space featuring only your original games.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
