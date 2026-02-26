// Catálogo de mensajes de error para YCC POS
// Cada mensaje incluye código, título, mensaje y acción recomendada

export interface ErrorMessage {
  code: string
  title: string
  message: string
  action?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

// AUTH Errors (AUTH_001-007)
export const AUTH_ERRORS: Record<string, ErrorMessage> = {
  'AUTH_001': {
    code: 'AUTH_001',
    title: 'Credenciales inválidas',
    message: 'El usuario o contraseña ingresados son incorrectos.',
    action: 'Verifica tus credenciales e intenta nuevamente.',
    severity: 'medium'
  },
  'AUTH_002': {
    code: 'AUTH_002',
    title: 'Usuario no encontrado',
    message: 'No existe una cuenta con el correo electrónico proporcionado.',
    action: 'Verifica el correo electrónico o crea una nueva cuenta.',
    severity: 'medium'
  },
  'AUTH_003': {
    code: 'AUTH_003',
    title: 'Contraseña incorrecta',
    message: 'La contraseña ingresada no es correcta.',
    action: 'Intenta nuevamente o utiliza la opción "Olvidé mi contraseña".',
    severity: 'medium'
  },
  'AUTH_004': {
    code: 'AUTH_004',
    title: 'Cuenta bloqueada',
    message: 'Tu cuenta ha sido bloqueada por múltiples intentos fallidos.',
    action: 'Contacta al administrador del sistema para desbloquear tu cuenta.',
    severity: 'high'
  },
  'AUTH_005': {
    code: 'AUTH_005',
    title: 'Sesión expirada',
    message: 'Tu sesión ha expirado por inactividad.',
    action: 'Inicia sesión nuevamente para continuar.',
    severity: 'low'
  },
  'AUTH_006': {
    code: 'AUTH_006',
    title: 'Permiso denegado',
    message: 'No tienes permisos para realizar esta acción.',
    action: 'Contacta al administrador si necesitas acceso a esta función.',
    severity: 'medium'
  },
  'AUTH_007': {
    code: 'AUTH_007',
    title: 'Token inválido',
    message: 'El token de autenticación no es válido o ha expirado.',
    action: 'Inicia sesión nuevamente para obtener un nuevo token.',
    severity: 'medium'
  }
}

// SALE Errors (SALE_001-007)
export const SALE_ERRORS: Record<string, ErrorMessage> = {
  'SALE_001': {
    code: 'SALE_001',
    title: 'Error al procesar pago',
    message: 'No se pudo procesar el pago con el método seleccionado.',
    action: 'Intenta con otro método de pago o contacta al soporte.',
    severity: 'high'
  },
  'SALE_002': {
    code: 'SALE_002',
    title: 'Stock insuficiente',
    message: 'No hay suficiente stock para uno o más productos.',
    action: 'Verifica el inventario o ajusta las cantidades.',
    severity: 'medium'
  },
  'SALE_003': {
    code: 'SALE_003',
    title: 'Producto no disponible',
    message: 'Uno de los productos seleccionados no está disponible actualmente.',
    action: 'Elimina el producto del carrito o selecciona una alternativa.',
    severity: 'medium'
  },
  'SALE_004': {
    code: 'SALE_004',
    title: 'Error en la conexión',
    message: 'No se pudo conectar con el servidor de procesamiento.',
    action: 'Verifica tu conexión a internet e intenta nuevamente.',
    severity: 'high'
  },
  'SALE_005': {
    code: 'SALE_005',
    title: 'Monto inválido',
    message: 'El monto ingresado no es válido.',
    action: 'Verifica el monto e intenta nuevamente.',
    severity: 'low'
  },
  'SALE_006': {
    code: 'SALE_006',
    title: 'Descuento no aplicable',
    message: 'El descuento no puede ser aplicado a esta venta.',
    action: 'Verifica las condiciones del descuento.',
    severity: 'low'
  },
  'SALE_007': {
    code: 'SALE_007',
    title: 'Caja cerrada',
    message: 'La caja está cerrada. No se pueden realizar ventas.',
    action: 'Abre la caja para comenzar a vender.',
    severity: 'high'
  }
}

// INVENTORY Errors (INV_001-003)
export const INV_ERRORS: Record<string, ErrorMessage> = {
  'INV_001': {
    code: 'INV_001',
    title: 'Producto duplicado',
    message: 'Ya existe un producto con este código o nombre.',
    action: 'Usa un código diferente o verifica si el producto ya existe.',
    severity: 'medium'
  },
  'INV_002': {
    code: 'INV_002',
    title: 'Stock negativo',
    message: 'No se puede establecer un stock negativo.',
    action: 'Ingresa un valor válido para el stock.',
    severity: 'low'
  },
  'INV_003': {
    code: 'INV_003',
    title: 'Movimiento inválido',
    message: 'El movimiento de inventario no es válido.',
    action: 'Verifica los datos del movimiento e intenta nuevamente.',
    severity: 'medium'
  }
}

// CONNECTION Errors (CONN_001-003)
export const CONN_ERRORS: Record<string, ErrorMessage> = {
  'CONN_001': {
    code: 'CONN_001',
    title: 'Sin conexión',
    message: 'No hay conexión a internet.',
    action: 'Verifica tu conexión e intenta nuevamente.',
    severity: 'high'
  },
  'CONN_002': {
    code: 'CONN_002',
    title: 'Servidor no disponible',
    message: 'El servidor no está respondiendo.',
    action: 'Intenta nuevamente en unos minutos o contacta al soporte.',
    severity: 'high'
  },
  'CONN_003': {
    code: 'CONN_003',
    title: 'Timeout de conexión',
    message: 'La conexión tardó demasiado tiempo.',
    action: 'Verifica tu conexión e intenta nuevamente.',
    severity: 'medium'
  }
}

// KDS Errors (KDS_001-002)
export const KDS_ERRORS: Record<string, ErrorMessage> = {
  'KDS_001': {
    code: 'KDS_001',
    title: 'Error de conexión WebSocket',
    message: 'No se pudo conectar con el sistema de cocina.',
    action: 'Verifica la conexión e intenta nuevamente.',
    severity: 'medium'
  },
  'KDS_002': {
    code: 'KDS_002',
    title: 'Ticket no encontrado',
    message: 'El ticket solicitado no existe.',
    action: 'Verifica el número de ticket e intenta nuevamente.',
    severity: 'low'
  }
}

// Función para obtener mensaje de error por código
export const getErrorMessage = (code: string): ErrorMessage | null => {
  const allErrors = {
    ...AUTH_ERRORS,
    ...SALE_ERRORS,
    ...INV_ERRORS,
    ...CONN_ERRORS,
    ...KDS_ERRORS
  }
  
  return allErrors[code] || null
}

// Función para obtener mensaje de error genérico
export const getGenericErrorMessage = (error?: Error): ErrorMessage => {
  return {
    code: 'GENERIC_001',
    title: 'Error inesperado',
    message: error?.message || 'Ha ocurrido un error inesperado.',
    action: 'Intenta nuevamente o contacta al soporte si el problema persiste.',
    severity: 'medium'
  }
}

// Función para formatear mensaje para toast
export const formatToastMessage = (error: ErrorMessage): {
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
} => {
  const type = error.severity === 'critical' || error.severity === 'high' 
    ? 'error' 
    : error.severity === 'medium' 
    ? 'warning' 
    : 'info'

  return {
    title: error.title,
    message: error.action ? `${error.message} ${error.action}` : error.message,
    type
  }
}

// Función para formatear mensaje para inline error
export const formatInlineErrorMessage = (error: ErrorMessage): string => {
  return error.action ? `${error.message} ${error.action}` : error.message
}

// Códigos de error por categoría
export const ERROR_CODES = {
  AUTH: Object.keys(AUTH_ERRORS),
  SALE: Object.keys(SALE_ERRORS),
  INV: Object.keys(INV_ERRORS),
  CONN: Object.keys(CONN_ERRORS),
  KDS: Object.keys(KDS_ERRORS)
} as const
