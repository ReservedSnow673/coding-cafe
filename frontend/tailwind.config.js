/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F5755',
          light: '#3d6f6c',
          dark: '#234442',
        },
        secondary: {
          DEFAULT: '#5A9690',
          light: '#6faaa5',
          dark: '#4a7d78',
        },
        dark: {
          DEFAULT: '#000000',
          card: '#0a0a0a',
          hover: '#151515',
        },
        light: {
          DEFAULT: '#FFFFFF',
          card: '#fafafa',
          hover: '#f5f5f5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '10px',
        'input': '8px',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(47, 87, 85, 0.3)',
        'glow-secondary': '0 0 20px rgba(90, 150, 144, 0.3)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(90, 150, 144, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(90, 150, 144, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
