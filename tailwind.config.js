/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        brand: ['Nunito', 'sans-serif'],
        georgian: ['"Noto Sans Georgian"', 'sans-serif'],
      },
      colors: {
        gray: {
          750: '#253338',
        },
        lizu: {
          green: '#58CC02',
          'green-dark': '#46A302',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          yellow: '#FFC800',
          'yellow-dark': '#E5B400',
          red: '#FF4B4B',
          'red-dark': '#EA2B2B',
          orange: '#FF9600',
          'orange-dark': '#E08500',
          purple: '#CE82FF',
          'purple-dark': '#A855F7',
          gray: '#E5E5E5',
          'gray-dark': '#AFAFAF',
        }
      },
      boxShadow: {
        '3d-green': '0 4px 0 #46A302',
        '3d-blue': '0 4px 0 #1899D6',
        '3d-yellow': '0 4px 0 #E5B400',
        '3d-red': '0 4px 0 #EA2B2B',
        '3d-gray': '0 4px 0 #AFAFAF',
        '3d-purple': '0 4px 0 #A855F7',
        '3d-white': '0 4px 0 #E5E5E5',
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
