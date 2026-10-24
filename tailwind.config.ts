import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        porcelain: "#FBFBFA",
        charcoal: "#0F172A",
        terracotta: "#C96442",
        "stone-border": "#CBD5E1",
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
        display: ["var(--font-rubik)", "var(--font-heebo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
