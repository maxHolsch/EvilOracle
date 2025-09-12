/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'evil-red': '#8B0000',
        'dark-red': '#660000',
        'blood-red': '#CC0000',
        'crimson': '#DC143C',
        'hellfire': '#FF4500',
      },
      animation: {
        'pulse-evil': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          from: { 'box-shadow': '0 0 20px #8B0000' },
          to: { 'box-shadow': '0 0 30px #FF4500, 0 0 40px #FF4500' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }
    },
  },
  plugins: [],
}