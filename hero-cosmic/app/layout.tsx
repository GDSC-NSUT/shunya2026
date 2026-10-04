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

export const metadata: Metadata = {
  metadataBase: new URL("https://shunya.gdgnsut.com"),
  title: "Shunya 2026",
  description:
    "Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together. Exploring how emerging technologies coexist with natural ecosystems to solve humanity’s greatest challenges.",
  openGraph: {
    title: "Shunya 2026",
    description:
      "Shunya 2026 is GDG NSUT’s flagship technology festival built around a bold vision — a future where technology and nature evolve together.",
    url: "https://shunya.gdgnsut.com",
    siteName: "Shunya 2026",
    images: [
      {
        url: "/og-image.jpg",
        width: 1024,
        height: 584,
        alt: "Shunya 2026 - GDG NSUT",
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
    images: ["/og-image.jpg"],
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
