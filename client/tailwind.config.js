/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Base Colors
        background: {
          DEFAULT: '#020617', // Slate 950
          secondary: '#0f172a', // Slate 900
          tertiary: '#1e293b', // Slate 800
        },
        // Primary Brand Colors (Electric Blue/Purple Vibe)
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5', // Indigo 600
          light: '#818cf8', // Indigo 400
          glow: 'rgba(99, 102, 241, 0.5)',
        },
        // Secondary Accents
        secondary: {
          DEFAULT: '#a855f7', // Purple 500
          hover: '#9333ea', // Purple 600
          glow: 'rgba(168, 85, 247, 0.5)',
        },
        // Text Colors
        text: {
          primary: '#f8fafc', // Slate 50
          secondary: '#cbd5e1', // Slate 300
          tertiary: '#94a3b8', // Slate 400
          muted: '#64748b', // Slate 500
        },
        // Status Colors w/ Dark Mode adjustments
        status: {
          success: '#10b981', // Emerald 500
          warning: '#f59e0b', // Amber 500
          error: '#ef4444', // Red 500
          info: '#3b82f6', // Blue 500
        },
        // Borders
        border: {
          DEFAULT: '#1e293b', // Slate 800
          light: '#334155', // Slate 700
          glass: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'], // Assuming we might add Outfit for headings later
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
