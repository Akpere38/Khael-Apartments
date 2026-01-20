/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A5F',      // Airbnb-style pink/red
        secondary: '#00A699',     // Teal accent
        dark: '#484848',          // Dark gray for text
        light: '#F7F7F7',         // Light background
      }
    },
  },
  plugins: [],
}