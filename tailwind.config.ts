import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7fee7",
          100: "#ecfccb",
          500: "#a3e635",
          600: "#84cc16",
          700: "#65a30d",
          900: "#365314"
        },
        mint: {
          50: "#f7fee7",
          100: "#ecfccb",
          600: "#84cc16",
          700: "#65a30d"
        },
        ink: {
          950: "#0f0f0f"
        }
      },
      boxShadow: {
        soft: "0 22px 60px rgba(15, 15, 15, 0.08)",
        card: "0 14px 35px rgba(15, 15, 15, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
