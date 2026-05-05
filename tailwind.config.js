/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdeed9',
          200: '#fbdab3',
          300: '#f9c08d',
          400: '#f69c67',
          500: '#f48b4a', // Main primary color
          600: '#e67029',
          700: '#c0581f',
          800: '#9a451c',
          900: '#7c391a',
        },
        secondary: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917', // Main secondary color
        },
      },
      fontFamily: {
        display: ['"Georgia"', '"Times New Roman"', 'serif'],
      },
      animation: {
        'tilt-in': 'tiltIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'tilt-out': 'tiltOut 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'lift': 'lift 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 3s ease-in-out infinite',
        'parallax-y': 'parallaxY 0.5s ease-out',
      },
      keyframes: {
        tiltIn: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) translateZ(0)' },
          '100%': { transform: 'rotateX(8deg) rotateY(8deg) translateZ(10px)' },
        },
        tiltOut: {
          '0%': { transform: 'rotateX(8deg) rotateY(8deg) translateZ(10px)' },
          '100%': { transform: 'rotateX(0deg) rotateY(0deg) translateZ(0)' },
        },
        lift: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        parallaxY: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },

  plugins: [],
}
