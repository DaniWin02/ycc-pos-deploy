/**
 * Tailwind Config - Admin Panel
 * Usa la configuración compartida del sistema de temas v2
 */

import sharedThemeConfig from '../shared/theme/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedThemeConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Mantener plugins específicos del Admin si los hay
  plugins: [],
}
