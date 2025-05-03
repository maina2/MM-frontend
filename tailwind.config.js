/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#2E7D32', // Green
          secondary: '#F59E0B', // Yellow
          accent: '#DC2626', // Red
          neutral: '#F5F5F5', // Off-White
          dark: '#1F2937', // Charcoal
        },
      },
    },
    plugins: [],
  };