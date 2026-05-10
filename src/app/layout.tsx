import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/lib/site";

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
    default: siteConfig.name,
    template: "%s | %s",
  },
  description: "A structured Next.js 16 and Tailwind CSS 4 application.",
};

const developmentPerformanceMeasurePatch = `
(() => {
  if (!window.performance || typeof window.performance.measure !== "function") {
    return;
  }

  const currentMeasure = window.performance.measure;

  if (currentMeasure.__negativeTimestampPatch) {
    return;
  }

  const originalMeasure = currentMeasure.bind(window.performance);

  function patchedMeasure(name, startOrMeasureOptions, endMark) {
    try {
      return originalMeasure(name, startOrMeasureOptions, endMark);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes("negative time stamp")) {
        throw error;
      }

      if (
        startOrMeasureOptions &&
        typeof startOrMeasureOptions === "object" &&
        !Array.isArray(startOrMeasureOptions)
      ) {
        const options = { ...startOrMeasureOptions };

        if (typeof options.start === "number" && options.start < 0) {
          options.start = 0;
        }

        if (typeof options.end === "number" && options.end < 0) {
          options.end = 0;
        }

        if (typeof options.duration === "number" && options.duration < 0) {
          options.duration = 0;
        }

        try {
          return originalMeasure(name, options);
        } catch {
          return undefined;
        }
      }

      return undefined;
    }
  }

  patchedMeasure.__negativeTimestampPatch = true;
  window.performance.measure = patchedMeasure;
})();
`;

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
      {process.env.NODE_ENV === "development" ? (
        <Script
          id="development-performance-measure-patch"
          strategy="beforeInteractive"
        >
          {developmentPerformanceMeasurePatch}
        </Script>
      ) : null}
      <body>{children}</body>
    </html>
  );
}
