/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#1a202c',
          text: '#e2e8f0',
          card: '#2d3748'
        }
      }
    },
  },
  plugins: [],
}