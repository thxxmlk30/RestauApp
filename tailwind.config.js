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
        display: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
