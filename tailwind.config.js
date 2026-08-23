/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E16',
        panel: '#0F1420',
        border: '#1E2636',
        amber: '#F2A93B',
        teal: '#4FD1A5',
        blue: '#7DA9F2',
        violet: '#C084F5',
        red: '#F76B6B',
        agent: '#7C8CFF'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      keyframes: {
        orb: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.25)', opacity: '0.35' }
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        orb: 'orb 1.4s ease-in-out infinite',
        sheetUp: 'sheetUp 260ms ease-out',
        fadeIn: 'fadeIn 220ms ease-out'
      }
    }
  },
  plugins: []
}
