import type { Metadata } from "next";
import {
  Source_Serif_4,
  Instrument_Serif,
  Instrument_Sans,
  Cormorant,
} from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getCartAction } from "@/lib/cart-actions";

// Runs before React hydration so the saved theme is applied before paint —
// otherwise the page flashes light then snaps to dark on mount.
const themeBootstrapScript = `
(function(){try{var t=localStorage.getItem('estrella-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){}})();
`;

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  weight: ["300", "400", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Astreylla — Lab-grown diamonds, jeweller-direct",
  description:
    "Browse certified loose diamonds at wholesale prices. GIA & IGI certified, lab-grown excellence, direct jeweller pricing.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialCart = await getCartAction();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body
        className={`${sourceSerif.variable} ${instrumentSerif.variable} ${instrumentSans.variable} ${cormorant.variable}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThemeProvider>
          <CartProvider initialCart={initialCart}>
            <SiteHeader />
            <main id="main" style={{ flex: 1 }}>
              {children}
            </main>
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
