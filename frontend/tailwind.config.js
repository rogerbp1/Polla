/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        binance: {
          yellow: '#F3BA2F',
          black: '#181A20',
          dark: '#1E2329',
          light: '#2B3139',
        },
        clf: {
          purple: '#A855F7',
          cyan: '#06B6D4',
        }
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
