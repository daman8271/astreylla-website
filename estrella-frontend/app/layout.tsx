import type { Metadata } from "next";
import { Source_Serif_4, Italiana, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  weight: ["300", "400", "600", "700"],
});

const italiana = Italiana({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-italiana",
  weight: ["400"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Estrella — Lab-grown diamonds, jeweller-direct",
  description:
    "Browse certified loose diamonds at wholesale prices. GIA & IGI certified, lab-grown excellence, direct jeweller pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${italiana.variable} ${instrumentSans.variable}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SiteHeader />
        <main id="main" style={{ flex: 1 }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
