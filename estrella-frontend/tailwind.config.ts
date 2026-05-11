import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--brand-bg)",
        bgWarm: "var(--brand-bg-warm)",
        bgSection: "var(--brand-bg-section)",
        ink: "var(--brand-text-primary)",
        inkSecondary: "var(--brand-text-secondary)",
        inkMuted: "var(--brand-text-muted)",
        gold: "var(--brand-accent-gold)",
        borderSubtle: "var(--brand-border-subtle)",
        borderStrong: "var(--brand-border-strong)",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        display: ["var(--font-instrument-serif)", "var(--font-source-serif)", "serif"],
        sans: ["var(--font-instrument-sans)", "-apple-system", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
