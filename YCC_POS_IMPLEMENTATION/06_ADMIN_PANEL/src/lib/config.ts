/**
 * Configuración global de URLs para Admin Panel
 */

// Asegurar que API_URL no tenga /api al final para evitar duplicación
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

// URL completa con /api
export const API_URL = `${API_BASE_URL}/api`;
