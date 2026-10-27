/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        brand: {
          primary: '#ea580c', // Warm cafeteria orange
          secondary: '#16a34a', // Fresh green
          dark: '#1e293b',
          accent: '#f97316'
        }
      }
    },
  },
  plugins: [],
}
