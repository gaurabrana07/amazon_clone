/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: '#FF9900',
          'orange-dark': '#E47911',
          blue: '#232F3E',
          'blue-light': '#37475A',
          yellow: '#FEBD69',
          'gray-light': '#F3F3F3',
          'gray-dark': '#DDDDDD'
        }
      },
      fontFamily: {
        amazon: ['Arial', 'sans-serif']
      },
      boxShadow: {
        'amazon': '0 2px 5px 0 rgba(213,217,217,.5)',
        'amazon-hover': '0 4px 8px 0 rgba(213,217,217,.8)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}