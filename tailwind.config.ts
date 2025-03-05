
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        haiku: {
          tile: "#F1F0FB",
          border: "#E2E8F0",
          text: "#1A1F2C",
        },
      },
      animation: {
        "tile-hover": "tile-hover 0.2s ease-out",
        "fade-in": "fade-in 1.2s ease-out",
        "scale-in": "scale-in 1.2s ease-out",
      },
      keyframes: {
        "tile-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { 
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": { 
            transform: "scale(1)",
            opacity: "1"
          },
        },
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
