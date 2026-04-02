import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        heading: ["Instrument Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // --- CONFIGURATION PALETTE ELC PARIS ---
        primary: {
          DEFAULT: "#8A0F8A",    // Violet (Boutons principaux)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1FB7A6",    // Turquoise (Actions secondaires)
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#F5486B",    // Rose (Alerte / Erreur)
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#6BCB2C",    // Vert (Validation)
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F2C811",    // Jaune (Accent)
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#F2C811",    // Jaune pour les accents visuels
          foreground: "#000000",
        },
        // ---------------------------------------

        info: {
          DEFAULT: "#1FB7A6",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "#8A0F8A",           // Violet pour la sidebar
          "primary-foreground": "#FFFFFF",
          accent: "#F2C811",            // Jaune pour l'élément actif
          "accent-foreground": "#000000",
          border: "hsl(var(--sidebar-border))",
          ring: "#8A0F8A",
          muted: "hsl(var(--sidebar-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;