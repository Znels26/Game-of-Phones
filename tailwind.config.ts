import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        realm: {
          bg: '#0a0806',
          surface: '#12100d',
          border: '#2a2218',
          gold: '#c9a84c',
          'gold-light': '#e8c97a',
          ember: '#e05a2b',
          blood: '#8b1a1a',
          frost: '#7ab8d4',
          shadow: '#1a1410',
          mist: '#3d4a5c',
          forest: '#2d5a2d',
          stone: '#6b6055',
          parchment: '#d4bc8a',
        }
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-crimson)', 'serif'],
        ui: ['var(--font-rajdhani)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 2s ease-in-out infinite',
        'march': 'march 1s linear infinite',
        'smoke': 'smoke 3s ease-out infinite',
        'storm': 'storm 0.5s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        march: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        smoke: {
          '0%': { opacity: '0.8', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scale(1.5)' },
        },
        storm: {
          '0%, 100%': { transform: 'translateX(-1px)' },
          '50%': { transform: 'translateX(1px)' },
        }
      }
    },
  },
  plugins: [],
}

export default config
