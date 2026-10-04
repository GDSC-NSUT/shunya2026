import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LiquidGlassNav from "../components/navigation/LiquidGlassNav";
import SmoothScroll from "../components/SmoothScroll";

const corpta = localFont({
  src: "../public/fonts/Corpta.ttf.otf",
  variable: "--font-corpta",
  preload: true,
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://shunyahero.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Shunya 2026",
  description:
    "Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together. Exploring how emerging technologies coexist with natural ecosystems to solve humanity’s greatest challenges.",
  openGraph: {
    title: "Shunya 2026",
    description:
      "Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together.",
    url: baseUrl,
    siteName: "Shunya 2026",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        secureUrl: `${baseUrl}/og-image.png`,
        width: 1024,
        height: 584,
        alt: "Shunya 2026 - GDG NSUT",
        type: "image/png",
      },
      {
        url: `${baseUrl}/og-image.jpg`,
        secureUrl: `${baseUrl}/og-image.jpg`,
        width: 1024,
        height: 584,
        alt: "Shunya 2026 - GDG NSUT",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shunya 2026",
    description:
      "Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together.",
    images: [`${baseUrl}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${corpta.variable} antialiased`}
    >
      <head>
        {/* Preload critical background images — CSS backgrounds are invisible to the preload scanner */}
        <link rel="preload" as="image" href="/cosmic/stars_deep.webp" type="image/webp" />
        <link rel="preload" as="image" href="/cosmic/stars_cinematic.webp" type="image/webp" />
        <link rel="preload" as="image" href="/cosmic/rich_green_nebula.webp" type="image/webp" />
      </head>
      <body className="bg-black text-white overflow-x-hidden font-corpta">
        <LiquidGlassNav />
        {/* SmoothScroll wraps all page content with Lenis cinematic lerped scrolling */}
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
