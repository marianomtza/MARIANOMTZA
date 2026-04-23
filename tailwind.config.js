/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#9b5fd6',
        'accent-soft': '#6b3fa8',
        'accent-deep': '#3d1d6e',
        'bg-deep': '#0a0610',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
        'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '0.24em',
      }
    },
  },
  plugins: [],
}