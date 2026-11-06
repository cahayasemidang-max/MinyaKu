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
        forest: {
          DEFAULT: "#244D38",
          dark: "#1A3828",
          light: "#2F6349",
        },
        cream: {
          DEFAULT: "#F5F0E4",
          light: "#FAF7F0",
          dark: "#EBE3D0",
        },
        sage: {
          DEFAULT: "#DCE9D9",
          light: "#EAF2E8",
          dark: "#C3D8BE",
        },
        ink: {
          DEFAULT: "#24352B",
          muted: "#68766B",
        },
        line: "#E3E8DF",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(36, 77, 56, 0.06), 0 1px 4px -1px rgba(36, 53, 43, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

