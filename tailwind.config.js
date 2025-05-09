/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6ebf4',
          100: '#ccd7e9',
          200: '#99afd3',
          300: '#6687be',
          400: '#335fa8',
          500: '#3B5998',
          600: '#2d4474',
          700: '#1f2f4f',
          800: '#121b2f',
          900: '#060a15',
        },
        secondary: {
          500: '#E6A23C',
        },
        success: {
          500: '#67C23A',
          600: '#529b2e',
        },
        danger: {
          500: '#F56C6C',
          600: '#c45656',
        },
        warning: {
          500: '#E6A23C',
        },
      },
    },
  },
  plugins: [],
};