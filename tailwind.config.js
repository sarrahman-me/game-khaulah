/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bubble: ['"Fredoka"', 'sans-serif'],
      },
      colors: {
        candy: {
          pink: '#FF6B8B',
          purple: '#9B51E0',
          yellow: '#FFD166',
          blue: '#4CC9F0',
          green: '#06D6A0',
        }
      }
    },
  },
  plugins: [],
}
