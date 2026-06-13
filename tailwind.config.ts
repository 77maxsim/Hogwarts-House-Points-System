import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Candlelit Ledger palette
        parchment: {
          DEFAULT: '#1a1108',
          light: '#231809',
          panel: '#1e1509',
          border: '#3d2e18',
          gold: '#c9a84c',
          'gold-bright': '#f0d080',
          'gold-dim': '#8a6e35',
        },
        // House colors
        gryffindor: {
          primary: '#7f1d1d',
          accent: '#b91c1c',
          gold: '#fbbf24',
          bg: 'rgba(127,29,29,0.15)',
          border: 'rgba(127,29,29,0.4)',
        },
        slytherin: {
          primary: '#14532d',
          accent: '#15803d',
          silver: '#9ca3af',
          bg: 'rgba(20,83,45,0.15)',
          border: 'rgba(20,83,45,0.4)',
        },
        ravenclaw: {
          primary: '#1e3a5f',
          accent: '#1d4ed8',
          bronze: '#b45309',
          bg: 'rgba(30,58,95,0.15)',
          border: 'rgba(30,58,95,0.4)',
        },
        hufflepuff: {
          primary: '#713f12',
          accent: '#92400e',
          yellow: '#fcd34d',
          bg: 'rgba(113,63,18,0.15)',
          border: 'rgba(113,63,18,0.4)',
        },
        // Semantic
        surface: '#1e1509',
        'surface-raised': '#251c0d',
        'surface-overlay': '#2d2010',
        ink: '#e8d5a3',
        'ink-muted': '#a89060',
        'ink-dim': '#6b5b3e',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'candlelit': 'radial-gradient(ellipse at 50% 0%, #2d1f0a 0%, #120d04 60%, #0a0803 100%)',
        'parchment-gradient': 'linear-gradient(135deg, #251c0d 0%, #1a1208 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201,168,76,0.15)',
        'panel': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.1)',
        'house-card': '0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
