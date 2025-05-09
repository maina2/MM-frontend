/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2D3748', // Sleek Dark Blue/Gray
        secondary: '#5A67D8', // Modern Purple/Blue
        accent: '#38B2AC', // Teal Accent
        neutral: '#F7FAFC', // Light Gray/Off-White
        dark: '#1A202C', // Darker Charcoal
        error: '#F87171', // Soft Red for errors

      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.3s ease-out',
        pulse: 'pulse 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
};