const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-heading)", "Outfit", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#059669", // emerald-600 - rich eco green
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        secondary: {
          DEFAULT: "#0284c7", // sky-600 - technology accent
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        surface: {
          light: "#ffffff",
          dark: "#0b0f17",
          card: "rgba(255, 255, 255, 0.8)",
          cardDark: "rgba(15, 23, 42, 0.75)",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(16, 185, 129, 0.08)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.04)",
        "glass-hover": "0 16px 40px 0 rgba(16, 185, 129, 0.12)",
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 20px 35px -4px rgba(15, 23, 42, 0.1), 0 8px 16px -4px rgba(15, 23, 42, 0.06)",
        float: "0 24px 48px -12px rgba(15, 23, 42, 0.18)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#059669",
              foreground: "#ffffff",
            },
            focus: "#10b981",
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#10b981",
              foreground: "#022c22",
            },
            focus: "#34d399",
          },
        },
      },
    }),
  ],
};
