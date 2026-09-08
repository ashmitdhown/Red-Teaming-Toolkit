/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        surface: {
          base: 'rgb(var(--col-base) / <alpha-value>)',
          panel: 'rgb(var(--col-panel) / <alpha-value>)',
          alt: 'rgb(var(--col-alt) / <alpha-value>)',
          dark: 'rgb(var(--col-dark) / <alpha-value>)'
        },
        ui: {
          border: 'rgb(var(--col-border) / <alpha-value>)',
          text: 'rgb(var(--col-text) / <alpha-value>)',
          muted: 'rgb(var(--col-muted) / <alpha-value>)',
          accent: 'rgb(var(--col-accent) / <alpha-value>)',
          alert: 'rgb(var(--col-alert) / <alpha-value>)',
          ok: 'rgb(var(--col-ok) / <alpha-value>)'
        }
      }
    }
  },
  plugins: [],
}
