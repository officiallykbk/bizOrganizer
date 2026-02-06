/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'bounce': 'bounce 1s ease-in-out infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateX(-50%)' },
          '50%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [],
};