/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        party: {
          pink: '#FF6B9D',
          'pink-light': '#FF8FAB',
          'pink-dark': '#E91E63',
          purple: '#9B59B6',
          blue: '#3498DB',
          yellow: '#F1C40F',
          orange: '#E67E22',
          green: '#2ECC71',
          red: '#E74C3C',
        },
        brown: {
          700: '#7B4B36',
          600: '#8B5A46',
          500: '#9B6A56',
          'dark': '#7B4B36',
          'medium': '#8B5A46',
          'light': '#9B6A56',
        }
      },
      fontFamily: {
        party: ['Fredoka', 'cursive'],
        playful: ['Nunito', 'sans-serif'],
        'bold-display': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'party-gradient': 'linear-gradient(135deg, #FF6B9D 0%, #9B59B6 100%)',
        'fun-gradient': 'linear-gradient(135deg, #F1C40F 0%, #E67E22 100%)',
        'celebration-gradient': 'linear-gradient(135deg, #3498DB 0%, #2ECC71 100%)',
        'rainbow-gradient': 'linear-gradient(135deg, #FF6B9D 0%, #9B59B6 25%, #3498DB 50%, #2ECC71 75%, #F1C40F 100%)',
      },
      animation: {
        'bounce-fun': 'bounce-fun 2s infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-party': 'pulse-party 2s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear infinite',
      },
      keyframes: {
        'bounce-fun': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '40%, 43%': { transform: 'translate3d(0, -10px, 0)' },
          '70%': { transform: 'translate3d(0, -5px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        'wiggle': {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'pulse-party': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotateZ(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotateZ(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}