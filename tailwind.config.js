/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // "VT323" is the closest Google Font match to the "Glass_TTY_VT220" in your files
        mono: ['"VT323"', 'monospace'],
      },
      colors: {
        // I used the Green from your screenshots, but you can swap to the Purple (#a855f7) from your code snippet here if you prefer.
        terminal: {
          bg: '#050505',
          main: '#33ff00', // Change this to #a855f7 for purple
          dim: '#1a5c0d',  // Change to #4c1d95 for dim purple
          glow: 'rgba(51, 255, 0, 0.6)' // The glow color
        }
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}