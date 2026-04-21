/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: 'rgba(255, 255, 255, 0.03)',
        surfaceBorder: 'rgba(255, 255, 255, 0.05)',
        primary: '#FFFFFF',
        accent: '#5E5CE6', // Copilot/Monarch vibe purple/blue
        success: '#32D74B', // iOS Green
        danger: '#FF453A', // iOS Red
        muted: '#8E8E93',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}