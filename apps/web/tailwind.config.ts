import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        meadow: {
          DEFAULT: "var(--meadow)",
          alt: "var(--meadow-alt)",
          dark: "var(--meadow-dark)",
          tint: "var(--meadow-tint)",
        },
        forest: {
          DEFAULT: "var(--forest)",
          2: "var(--forest-2)",
        },
        cream: {
          DEFAULT: "var(--cream)",
          alt: "var(--cream-alt)",
        },
        white: "var(--white)",
        amber: {
          DEFAULT: "var(--amber)",
          alt: "var(--amber-alt)",
        },
        sage: "var(--sage)",
        border: "var(--border)",
      },
      boxShadow: {
        forest: "var(--shadow-forest-tint)",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
