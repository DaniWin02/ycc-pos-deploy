/**
 * API Client para KDS - Consumir datos reales del backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

interface ApiFetchOptions extends RequestInit {
  body?: any;
}

/**
 * Cliente HTTP centralizado
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  // Validar que endpoint no empiece con /api (ya está en base URL)
  if (endpoint.startsWith('/api')) {
    console.warn(`⚠️ Endpoint "${endpoint}" no debe empezar con /api`);
    endpoint = endpoint.replace(/^\/api/, '');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  console.log(`🌐 KDS API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);

    // Detectar respuestas HTML (error de ruta)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`Respuesta no es JSON. Posible error de ruta: ${url}`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ KDS API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        data: errorData
      });
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ KDS API Success: ${options.method || 'GET'} ${url}`);
    return data;
  } catch (error: any) {
    console.error('❌ KDS API Request Failed:', error.message);
    throw error;
  }
};

/**
 * Helpers para operaciones comunes
 */
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => apiFetch<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: any) => apiFetch<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};

/**
 * Endpoints específicos del KDS
 */
export const endpoints = {
  sales: {
    list: (status?: string) => status ? `/sales?status=${status}` : '/sales',
    get: (id: string) => `/sales/${id}`,
    update: (id: string) => `/sales/${id}`,
    pending: () => '/sales?status=PENDING',
    completed: () => '/sales?status=COMPLETED'
  },
  products: {
    list: () => '/products'
  }
};

/**
 * Tipos para el KDS
 */
export interface KDSOrder {
  id: string;
  folio: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  notes?: string;
  items: KDSOrderItem[];
  terminal?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface KDSOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: any;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}
