/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6',
        surface: '#FFFFFF',
        charcoal: {
          900: '#181A1B',
          800: '#23272A',
          700: '#343A40',
          600: '#495057',
          500: '#6C757D',
          400: '#ADB5BD',
          200: '#DEE2E6',
          100: '#E9ECEF',
          50: '#F8F9FA'
        },
        emerald: {
          900: '#064E3B',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          200: '#A7F3D0',
          100: '#D1FAE5',
          50: '#ECFDF5'
        },
        amber: {
          800: '#92400E',
          700: '#B45309',
          600: '#D97706',
          500: '#F59E0B',
          100: '#FEF3C7',
          50: '#FFFBEB'
        },
        rose: {
          800: '#991B1B',
          700: '#B91C1C',
          600: '#DC2626',
          500: '#EF4444',
          100: '#FEE2E2',
          50: '#FEF2F2'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif'
        ]
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        'radar-ping': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'shimmer-slide': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-pop': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ecg-draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'radar-ping 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'shimmer-slide': 'shimmer-slide 3s ease-in-out infinite',
        'float-gentle': 'float-gentle 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-pop': 'scale-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ecg-draw': 'ecg-draw 4s linear infinite'
      }
    },
  },
  plugins: [],
}
