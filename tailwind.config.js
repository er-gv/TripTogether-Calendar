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
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontSize: {
        'medium': '1.1rem', // 18px
        'large': '1.16rem', // 18px
        'extra-large': '1.25rem', // 18px
        // custom 2lg sits between xl and 2xl (~22px)
        '2lg': ['1.375rem', { lineHeight: '1.75rem' }], // ~22px      
        '4lg': ['2.75rem', { lineHeight: '3.5rem' }], // ~44px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem', // 48px
      },
    },
  },
  plugins: [],
}