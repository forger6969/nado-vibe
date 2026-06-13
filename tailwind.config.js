/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#F9F9F9',
            100: '#F0F0F0',
            200: '#E0E0E0',
            300: '#C0C0C0',
            400: '#888888',
            500: '#555555',
            600: '#333333',
            700: '#222222',
            800: '#1A1A1A',
            900: '#111111',
          },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

