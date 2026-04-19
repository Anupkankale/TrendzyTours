import type { Config } from "tailwindcss"

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
    "./plugins/**/*.{js,ts}",
    "./content/**/*.md",
  ],
  theme: {
    extend: {
      // ─── Brand palette ──────────────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#eef6fb",
          100: "#d5eaf5",
          200: "#a9d4eb",
          300: "#74b7dc",
          400: "#459aca",
          500: "#1E6C93",   // ← PRIMARY brand colour
          600: "#195d7e",
          700: "#134c68",
          800: "#0e3c52",
          900: "#092d3e",
          950: "#061e2b",
        },
        dark: {
          50:  "#f6f6f7",
          100: "#e1e2e5",
          200: "#c3c6cb",
          300: "#9da1ab",
          400: "#787d89",
          500: "#5d6270",
          600: "#4a4f5c",
          700: "#3c404b",
          800: "#333741",
          900: "#1e2028",
          950: "#13151c",
        },

        // ─── Semantic token colours (point to CSS variables) ──────────────────
        // Change the variable in tailwind.css → changes EVERYWHERE on the site.
        heading:    "var(--color-heading)",
        body:       "var(--color-body)",
        muted:      "var(--color-muted)",
        subtle:     "var(--color-subtle)",
        accent:     "var(--color-accent)",
        "on-brand": "var(--color-on-brand)",
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        heading: ['"Playfair Display"', "Georgia", "serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },

      // Pixel-perfect font sizes — name maps to the CSS variable value in :root
      fontSize: {
        "display":  ["var(--text-display)",  { lineHeight: "var(--leading-display)",  letterSpacing: "-0.025em" }],
        "h1":       ["var(--text-h1)",       { lineHeight: "var(--leading-heading)",  letterSpacing: "-0.02em"  }],
        "h2":       ["var(--text-h2)",       { lineHeight: "var(--leading-heading)",  letterSpacing: "-0.015em" }],
        "h3":       ["var(--text-h3)",       { lineHeight: "var(--leading-subhead)",  letterSpacing: "-0.01em"  }],
        "h4":       ["var(--text-h4)",       { lineHeight: "var(--leading-subhead)"  }],
        "h5":       ["var(--text-h5)",       { lineHeight: "var(--leading-body)"     }],
        "h6":       ["var(--text-h6)",       { lineHeight: "var(--leading-body)"     }],
        "body-lg":  ["var(--text-body-lg)",  { lineHeight: "var(--leading-body)"     }],
        "body":     ["var(--text-body)",     { lineHeight: "var(--leading-body)"     }],
        "body-sm":  ["var(--text-body-sm)",  { lineHeight: "var(--leading-body)"     }],
        "caption":  ["var(--text-caption)",  { lineHeight: "var(--leading-tight)"    }],
      },

      // ─── Spacing / layout ───────────────────────────────────────────────────
      spacing: {
        "section-x":  "var(--section-x)",
        "section-y":  "var(--section-y)",
        "card-pad":   "var(--card-pad)",
      },

      // ─── Backgrounds / shadows ───────────────────────────────────────────────
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #459aca 0%, #1E6C93 50%, #134c68 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)",
      },
      boxShadow: {
        glass:     "0 8px 32px rgba(30,108,147,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        "glass-lg":"0 20px 60px rgba(30,108,147,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        "glass-nav":"0 1px 24px rgba(30,108,147,0.10), 0 1px 4px rgba(0,0,0,0.04)",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config
