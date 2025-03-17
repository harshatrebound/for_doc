/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4C39',
          light: '#FF513C',
          dark: '#FF513C',
        },
        secondary: '#FFB573',
        neutral: {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#EEEEEE',
          300: '#E3E3E3',
          400: '#C1C1C1',
          500: '#B1B1B1',
          600: '#979797',
          700: '#757575',
          800: '#636363',
          900: '#313131',
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'urbanist': ['Urbanist', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, #FF4C39 0%, #FFB573 100%)',
      },
      boxShadow: {
        'card': '0px 4px 10px 8px rgba(0, 0, 0, 0.04)',
        'nav': '0px 5px 15px 10px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
