/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: 'rgba(255, 255, 255, 0.02)',
        primary: '#00FF9D',
        accent: '#FF3366',
      },
      fontFamily: {
        mono: ['"Space Grotesk"', '"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}