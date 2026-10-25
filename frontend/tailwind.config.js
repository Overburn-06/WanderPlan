/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        pastel: {
          blue: '#e0f2fe',
          indigo: '#e0e7ff',
          sky: '#f0f9ff',
          mint: '#ecfdf5',
          amber: '#fef3c7',
          rose: '#ffe4e6',
          purple: '#f3e8ff',
        }
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(99, 102, 241, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'btn': '0 4px 14px -1px rgba(79, 70, 229, 0.35)',
      }
    },
  },
  plugins: [],
}
