import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: {
          DEFAULT: "#111111",
          light: "#1F1F1F",
        },
        cement: "#F7F6F2",
        safety: {
          DEFAULT: "#F2B705",
          dark: "#D9A400",
        },
        steel: "#6B7280",
        alert: "#C4432B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
