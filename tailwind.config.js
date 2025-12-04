/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'protardio-green': '#00ff00',
        'protardio-magenta': '#ff00ff',
        'protardio-red': '#dc2626',
        'protardio-yellow': '#facc15',
        'protardio-bg': '#0a0a0a',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['monospace'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'glitch': 'glitch 0.1s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        glitch: {
          '0%, 100%': { filter: 'hue-rotate(0deg) saturate(1)' },
          '50%': { filter: 'hue-rotate(90deg) saturate(2)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 0, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
