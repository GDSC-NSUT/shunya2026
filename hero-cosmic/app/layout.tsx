import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LiquidGlassNav from "../components/navigation/LiquidGlassNav";

const corpta = localFont({
  src: "../public/fonts/Corpta.ttf.otf",
  variable: "--font-corpta",
  preload: true,
});

export const metadata: Metadata = {
  title: "Cosmic HUD Hero",
  description: "A premium cosmic hero with cursor-localized HUD scanner interaction",
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
      <body className="bg-black text-white overflow-x-hidden font-corpta"><LiquidGlassNav />{children}</body>
    </html>
  );
}
