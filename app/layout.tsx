import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Cormorant Garamond (weight 300) is used for the "CLAUDE MYTHOS" title.
// Inter is used for body copy and the subtitle / [ enter ] affordance.
// The IntroAnimation component also self-injects a Google Fonts <link> so it
// works standalone in any project, but exposing these as CSS variables here is
// the idiomatic Next.js path and avoids a flash of unstyled text.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Claude Mythos",
  description: "Anthropic's upcoming flagship model",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
