/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#020617', // deepest black slate
          900: '#0b1120', // panel bg
          850: '#0f172a', // card bg
          800: '#1e293b', // hover/secondary card
          750: '#26344d',
          700: '#334155', // borders
          600: '#475569', // muted borders / icons
          500: '#64748b',
          400: '#94a3b8', // secondary text
          300: '#cbd5e1',
          200: '#e2e8f0', // primary text
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        status: {
          normal: {
            DEFAULT: '#10b981', // emerald-500
            glow: '#059669',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.3)',
          },
          warning: {
            DEFAULT: '#f59e0b', // amber-500
            glow: '#d97706',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.35)',
          },
          critical: {
            DEFAULT: '#ef4444', // rose/red-500
            glow: '#dc2626',
            bg: 'rgba(239, 68, 68, 0.15)',
            border: 'rgba(239, 68, 68, 0.4)',
          },
          stale: {
            DEFAULT: '#f97316', // orange-500
            bg: 'rgba(249, 115, 22, 0.12)',
            border: 'rgba(249, 115, 22, 0.3)',
          },
          offline: {
            DEFAULT: '#64748b', // slate-500
            bg: 'rgba(100, 116, 139, 0.12)',
            border: 'rgba(100, 116, 139, 0.25)',
          }
        },
        electric: {
          blue: '#38bdf8', // sky-400
          cyan: '#06b6d4', // cyan-500
          amber: '#f59e0b',
          green: '#10b981',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'Fira Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'panel-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.25)',
        'glow-rose': '0 0 15px rgba(239, 68, 68, 0.3)',
        'glow-blue': '0 0 15px rgba(56, 189, 248, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-critical': 'flashCritical 1.5s infinite',
      },
      keyframes: {
        flashCritical: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
