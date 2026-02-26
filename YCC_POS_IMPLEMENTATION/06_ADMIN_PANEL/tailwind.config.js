/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin Panel Theme
        admin: {
          sidebar: '#2D1810',      // Café oscuro
          'sidebar-hover': '#3D2414',
          'sidebar-active': '#4D2F1E',
          content: '#F9FAFB',      // Gris muy claro
          border: '#E5E7EB',
          text: '#111827',
          'text-secondary': '#6B7280',
          primary: '#059669',      // Verde esmeralda
          'primary-hover': '#047857',
          warning: '#D97706',      // Ámbar
          danger: '#DC2626',       // Rojo
          success: '#16A34A',      // Verde
        },
        // Status colors
        status: {
          online: '#10B981',
          offline: '#EF4444',
          pending: '#F59E0B',
          completed: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
