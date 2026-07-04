/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // GFS Brand Colors
        // GFS Brand Colors - Premium Gold & Light Cream Theme
        gold: {
          50: "#fdf8e7",
          100: "#fbf0c4",
          200: "#f7e08a",
          300: "#f2cc4f",
          400: "#edb92a",
          500: "#D4AF37", // Main GFS Gold
          600: "#b8951e",
          700: "#9a7819",
          800: "#7d601a",
          900: "#664f1b",
        },
        navy: {
          50: "#fdfbf7",
          100: "#f7f3e8",
          200: "#ebdcb9",
          300: "#d9bd7e",
          400: "#bda059",
          500: "#9b7f3d",
          600: "#7b612c",
          700: "#5a4521",
          800: "#ffffff", // Pure White Cards
          900: "#FCFAF7", // Light Cream Background Base
          950: "#f5f1e9",
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
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      backgroundImage: {
        "gfs-gradient": "linear-gradient(135deg, #FCFAF7 0%, #F5F1E9 50%, #FCFAF7 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #f2cc4f 50%, #D4AF37 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(253,251,247,0.95) 100%)",
      },
      boxShadow: {
        "gold": "0 0 20px rgba(212,175,55,0.15)",
        "gold-lg": "0 0 40px rgba(212,175,55,0.25)",
        "card": "0 4px 24px rgba(212,175,55,0.05)",
        "card-hover": "0 8px 30px rgba(212,175,55,0.1)",
        "glow": "0 0 15px rgba(212,175,55,0.1), 0 0 40px rgba(212,175,55,0.05)",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(212,175,55,0.25)" },
          "50%": { boxShadow: "0 0 25px rgba(212,175,55,0.55)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
