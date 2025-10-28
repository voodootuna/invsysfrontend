/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',
        'primary-light': '#60A5FA',
        'primary-dark': '#1E40AF',
        'accent': '#10B981',
        'accent-light': '#34D399',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'surface': '#FFFFFF',
        'surface-secondary': '#F8FAFC',
        'dark': '#0F172A',
        'dark-light': '#1E293B'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem'
      }
    }
  },
  plugins: [],
}