/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KDS Dark Theme - Optimizado para cocina
        kds: {
          bg: '#0F0F0F',        // Fondo pantalla
          card: '#1E1E1E',      // Fondo ticket
          border: '#333333',     // Borde ticket
          text: '#F5F5F5',      // Texto principal
          secondary: '#A0A0A0',  // Texto secundario
          header: '#3C2415',    // Header café
          timer: {
            green: '#22C55E',   // < 5 min
            yellow: '#EAB308',  // 5-10 min
            red: '#EF4444',     // > 10 min
            pulse: '#EF4444',    // > 15 min parpadeante
          }
        }
      },
      animation: {
        'pulse-red': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-top': 'slideInTop 0.3s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
