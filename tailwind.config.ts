import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        // ベースカラー: クリーム色・薄いベージュ
        cream: {
          DEFAULT: "#FFF8DC",
          50: "#FFFEF9",
          100: "#FFF8DC",
          200: "#FFF0C8",
        },
        // メインカラー: サーモンピンク・温かみのあるオレンジ
        salmon: {
          DEFAULT: "#FFB6C1",
          50: "#FFF0F2",
          100: "#FFB6C1",
          200: "#FF9FAF",
          300: "#FF8FA0",
        },
        orange: {
          warm: "#FFA07A",
          light: "#FFD4B3",
        },
        // アクセント: ミントグリーン
        mint: {
          DEFAULT: "#98D8C8",
          50: "#E8F8F5",
          100: "#98D8C8",
          200: "#7BC4B0",
        },
        // テキスト: チャコールグレー
        charcoal: {
          DEFAULT: "#4A4A4A",
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#B0B0B0",
          300: "#808080",
          400: "#4A4A4A",
          500: "#2A2A2A",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "paw-print": {
          "0%": {
            opacity: "0",
            transform: "translate(-50%, -50%) scale(0.2) rotate(-10deg)",
          },
          "20%": {
            opacity: "0.6",
            transform: "translate(-50%, -50%) scale(0.8) rotate(5deg)",
          },
          "40%": {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1.2) rotate(-3deg)",
          },
          "60%": {
            opacity: "0.9",
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
          },
          "100%": {
            opacity: "0.3",
            transform: "translate(-50%, -50%) scale(0.9) rotate(0deg)",
          },
        },
        "paw-bounce": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-15px) scale(1.1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "paw-print": "paw-print 0.6s ease-out",
        "paw-bounce": "paw-bounce 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

