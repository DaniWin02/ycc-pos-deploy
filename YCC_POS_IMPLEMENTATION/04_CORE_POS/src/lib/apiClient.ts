/**
 * API Client - Única fuente de verdad para todas las llamadas al backend
 * 
 * REGLAS:
 * 1. NUNCA usar fetch() directamente en componentes
 * 2. TODAS las llamadas deben pasar por este cliente
 * 3. El prefijo /api ya está incluido en API_BASE_URL
 * 4. Los endpoints NO deben empezar con /api
 * 
 * Ejemplo correcto:
 *   apiFetch('/products')           ✅
 *   apiFetch('/cash-sessions/open') ✅
 * 
 * Ejemplo incorrecto:
 *   apiFetch('/api/products')       ❌ (duplica /api)
 */

// Base URL con /api incluido
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

// Exportar para uso en ThemeProvider y otros módulos
export const API_URL = API_BASE_URL.replace(/\/api$/, ''); // Sin /api para ThemeProvider

interface ApiFetchOptions extends RequestInit {
  body?: any;
}

/**
 * Cliente HTTP centralizado con manejo robusto de errores
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  // Validar que el endpoint no empiece con /api (prevenir duplicación)
  if (endpoint.startsWith('/api')) {
    console.warn(`⚠️ Endpoint "${endpoint}" no debe empezar con /api. Se removerá automáticamente.`);
    endpoint = endpoint.replace(/^\/api/, '');
  }

  // Asegurar que el endpoint empiece con /
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Configurar headers por defecto
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Serializar body si es objeto
  const body = options.body
    ? typeof options.body === 'string'
      ? options.body
      : JSON.stringify(options.body)
    : undefined;

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    // Intentar parsear respuesta
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Si no es JSON, obtener texto para debugging
      const text = await response.text();
      
      if (!response.ok) {
        console.error('❌ API Error (non-JSON):', {
          status: response.status,
          statusText: response.statusText,
          url,
          response: text.substring(0, 200), // Primeros 200 chars
        });
        
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}\n` +
          `Respuesta no es JSON. Posible error de ruta o servidor devolviendo HTML.`
        );
      }
      
      data = text;
    }

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        data,
      });

      throw new Error(
        data?.error || 
        data?.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    console.log(`✅ API Success: ${options.method || 'GET'} ${url}`);
    return data as T;

  } catch (error) {
    // Si es un error de red o fetch
    if (error instanceof TypeError) {
      console.error('❌ Network Error:', {
        url,
        message: error.message,
      });
      throw new Error(`Error de red: No se pudo conectar al servidor en ${url}`);
    }

    // Re-lanzar otros errores
    throw error;
  }
};

/**
 * Métodos helper para operaciones comunes
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T = any>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Endpoints específicos del sistema - Documentación de rutas disponibles
 */
export const endpoints = {
  // Productos
  products: {
    list: () => '/products',
    get: (id: string) => `/products/${id}`,
    create: () => '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },

  // Categorías
  categories: {
    list: () => '/categories',
    get: (id: string) => `/categories/${id}`,
    create: () => '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },

  // Sesiones de caja
  cashSessions: {
    open: () => '/cash-sessions/open',
    close: (id: string) => `/cash-sessions/close/${id}`,
    active: (terminalId: string) => `/cash-sessions/active/${terminalId}`,
    list: () => '/cash-sessions',
  },

  // Turnos
  shifts: {
    start: () => '/shifts/start',
    end: (id: string) => `/shifts/end/${id}`,
    current: (userId: string) => `/shifts/current/${userId}`,
    list: () => '/shifts',
  },

  // Movimientos de caja
  cashMovements: {
    list: () => '/cash-movements',
    create: () => '/cash-movements',
    summary: () => '/cash-movements/summary',
  },

  // Ventas
  sales: {
    list: () => '/sales',
    create: () => '/sales',
    get: (id: string) => `/sales/${id}`,
  },

  // Comandas
  comandas: {
    list: () => '/comandas',
    create: () => '/comandas',
    get: (id: string) => `/comandas/${id}`,
    update: (id: string) => `/comandas/${id}`,
  },

  // Utilidades
  health: () => '/health',
  initData: () => '/init-data',
};

export default api;
