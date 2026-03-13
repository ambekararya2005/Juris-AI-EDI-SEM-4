/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B3A6B',
        'blue-brand': '#2E5DA6',
        gold: '#E8A020',
        'light-blue': '#EBF1FA',
        'dark-text': '#1A1A2E',
        'muted-text': '#6B7A99',
        'surface-gray': '#F4F6FB',
        border: '#C5D5EE',
        success: '#1E7E5A',
        risk: '#C0392B',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(43,93,166,0.10)',
        'card-hover': '0 8px 32px rgba(43,93,166,0.18)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'progress-fill': 'progressFill 1.5s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        progressFill: {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
      },
    },
  },
  plugins: [],
}
