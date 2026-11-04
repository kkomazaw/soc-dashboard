/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        'critical': '#dc2626',
        'high': '#ea580c',
        'medium': '#facc15',
        'low': '#22c55e',
      },
    },
  },
  plugins: [],
}
