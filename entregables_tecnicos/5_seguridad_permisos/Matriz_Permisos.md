# Matriz de Permisos - Country Club POS

## 1. Definición de Roles

### 1.1 Roles del Sistema
```typescript
enum Role {
  CASHIER = 'CASHIER',           // Cajero
  WAITER = 'WAITER',             // Mesero
  SUPERVISOR = 'SUPERVISOR',     // Supervisor
  WAREHOUSE = 'WAREHOUSE',       // Almacén
  ADMIN = 'ADMIN',               // Administrador
  REPORTER = 'REPORTER',         // Reportes
  IT_SUPPORT = 'IT_SUPPORT'      // Soporte TI
}
```

### 1.2 Descripción de Roles

| Rol | Descripción | Responsabilidades Principales |
|-----|-------------|------------------------------|
| **CASHIER** | Operador de caja | Procesar ventas, manejar efectivo, abrir/cerrar turnos |
| **WAITER** | Mesero/Runner | Tomar pedidos, enviar comandas, procesar pagos móviles |
| **SUPERVISOR** | Supervisor de turno | Autorizar operaciones críticas, cerrar turnos, manejar incidencias |
| **WAREHOUSE** | Personal de almacén | Gestionar inventario, ajustes, recepciones |
| **ADMIN** | Administrador del sistema | Configuración completa, gestión de usuarios, reportes avanzados |
| **REPORTER** | Analista de datos | Acceso a reportes, exportación de datos |
| **IT_SUPPORT** | Soporte técnico | Mantenimiento, diagnóstico, configuración técnica |

## 2. Matriz de Permisos por Rol

### 2.1 Módulo de Ventas (Sales)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `sales.create` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `sales.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `sales.update` | ✅ (solo propios) | ✅ (solo propios) | ✅ | ❌ | ✅ | ❌ | ❌ |
| `sales.delete` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `sales.void` | ✅ (mismo día) | ✅ (mismo día) | ✅ (cualquier fecha) | ❌ | ✅ | ❌ | ❌ |
| `sales.refund` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `sales.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |

### 2.2 Módulo de Pagos (Payments)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `payments.create` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `payments.read` | ✅ (propios) | ✅ (propios) | ✅ | ❌ | ✅ | ✅ | ✅ |
| `payments.capture` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `payments.void` | ✅ (mismo día) | ✅ (mismo día) | ✅ (cualquier fecha) | ❌ | ✅ | ❌ | ❌ |
| `payments.refund` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `payments.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |

### 2.3 Módulo de Socios (Members)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `members.read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `members.search` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `members.create` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `members.update` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `members.delete` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `members.charges.create` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `members.charges.read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `members.charges.void` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

### 2.4 Módulo de Caja/Turnos (Cash/Shifts)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `shifts.open` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `shifts.close` | ✅ (propios) | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `shifts.read` | ✅ (propios) | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `shifts.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `cash.movements.create` | ✅ (propios) | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `cash.movements.read` | ✅ (propios) | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `cash.reconcile` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |

### 2.5 Módulo de Productos (Products)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `products.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `products.search` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `products.create` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `products.update` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `products.delete` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `products.price.change` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `products.export` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.6 Módulo de Inventario (Inventory)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `inventory.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `inventory.adjust.create` | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `inventory.adjust.approve` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `inventory.count.create` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `inventory.count.approve` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `inventory.movements.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `inventory.export` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.7 Módulo de Descuentos (Discounts)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `discounts.apply` | ✅ (≤10%) | ✅ (≤10%) | ✅ (≤25%) | ❌ | ✅ (sin límite) | ❌ | ❌ |
| `discounts.create` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `discounts.read` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `discounts.approve` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `discounts.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |

### 2.8 Módulo de Usuarios (Users)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `users.create` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `users.read` | ✅ (propio) | ✅ (propio) | ✅ | ❌ | ✅ | ✅ | ✅ |
| `users.update` | ✅ (propio: password) | ✅ (propio: password) | ✅ | ❌ | ✅ | ❌ | ❌ |
| `users.delete` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `users.roles.assign` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `users.activate` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `users.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |

### 2.9 Módulo de Configuración (Settings)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `settings.read` | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| `settings.update` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `terminals.configure` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `areas.configure` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `taxes.configure` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `payment.methods.configure` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

### 2.10 Módulo de Reportes (Reports)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `reports.sales.daily` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `reports.sales.monthly` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `reports.cash.reconciliation` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `reports.inventory.status` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `reports.members.activity` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `reports.audit.trail` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `reports.export.all` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### 2.11 Módulo de Auditoría (Audit)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `audit.read` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `audit.export` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `audit.search` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `audit.purge` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

### 2.12 Módulo de Sistema (System)

| Permiso | CASHIER | WAITER | SUPERVISOR | WAREHOUSE | ADMIN | REPORTER | IT_SUPPORT |
|---------|---------|--------|-------------|-----------|-------|-----------|-------------|
| `system.health` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `system.logs.read` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `system.backup.create` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `system.maintenance` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `system.monitoring` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

## 3. Reglas de Negocio Adicionales

### 3.1 Límites de Montos por Rol
```typescript
const discountLimits = {
  CASHIER: { percentage: 0.10, amount: 500.00 },
  WAITER: { percentage: 0.10, amount: 300.00 },
  SUPERVISOR: { percentage: 0.25, amount: 2000.00 },
  ADMIN: { percentage: 1.00, amount: Infinity }
};

const refundLimits = {
  SUPERVISOR: { amount: 5000.00, sameDayOnly: false },
  ADMIN: { amount: Infinity, sameDayOnly: false }
};

const cashMovementLimits = {
  CASHIER: { amount: 10000.00, requiresApproval: 5000.00 },
  SUPERVISOR: { amount: 50000.00, requiresApproval: 20000.00 },
  ADMIN: { amount: Infinity, requiresApproval: 0 }
};
```

### 3.2 Restricciones Temporales
```typescript
const timeRestrictions = {
  // Cancelaciones de ventas
  CASHIER: { voidHours: 24, requireSupervisorAfter: 8 },
  WAITER: { voidHours: 24, requireSupervisorAfter: 8 },
  SUPERVISOR: { voidHours: 72, requireSupervisorAfter: 24 },
  
  // Modificaciones de precios
  WAREHOUSE: { priceChangeHours: 48, requireApprovalAfter: 12 },
  ADMIN: { priceChangeHours: Infinity, requireApprovalAfter: 0 },
  
  // Apertura/cierre de turnos
  CASHIER: { shiftHours: 12, requireSupervisorAfter: 16 },
  SUPERVISOR: { shiftHours: 24, requireSupervisorAfter: 0 }
};
```

### 3.3 Reglas de Aprobación
```typescript
const approvalRules = {
  // Descuentos altos
  discount: {
    threshold: 0.15, // 15%
    requiredRole: 'SUPERVISOR',
    maxThreshold: 0.25, // 25%
    adminRequiredAbove: 0.25
  },
  
  // Cancelaciones tardías
  void: {
    hoursThreshold: 8,
    requiredRole: 'SUPERVISOR',
    maxHours: 72,
    adminRequiredAbove: 72
  },
  
  // Movimientos de efectivo grandes
  cashMovement: {
    amountThreshold: 5000.00,
    requiredRole: 'SUPERVISOR',
    maxAmount: 50000.00,
    adminRequiredAbove: 50000.00
  },
  
  // Ajustes de inventario
  inventoryAdjustment: {
    amountThreshold: 1000.00,
    requiredRole: 'SUPERVISOR',
    maxAmount: 10000.00,
    adminRequiredAbove: 10000.00
  }
};
```

## 4. Implementación Técnica

### 4.1 Middleware de Verificación de Permisos
```typescript
// Express middleware
function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userPermissions = await getUserPermissions(user.id);
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          details: {
            required: permission,
            user: userPermissions
          }
        }
      });
    }
    
    next();
  };
}

// Uso en routes
router.post('/sales', 
  authenticate,
  requirePermission('sales.create'),
  createSaleHandler
);
```

### 4.2 Verificación de Reglas de Negocio
```typescript
class BusinessRuleValidator {
  static async validateDiscount(user: User, discountAmount: number, totalAmount: number) {
    const discountPercentage = discountAmount / totalAmount;
    const limits = discountLimits[user.role];
    
    if (discountPercentage > limits.percentage) {
      throw new ForbiddenError(`Discount exceeds ${limits.percentage * 100}% limit`);
    }
    
    if (discountAmount > limits.amount) {
      throw new ForbiddenError(`Discount amount exceeds ${limits.amount} limit`);
    }
    
    // Verificar si requiere aprobación
    if (discountPercentage > 0.15) {
      return { requiresApproval: true, requiredRole: 'SUPERVISOR' };
    }
    
    return { requiresApproval: false };
  }
}
```

### 4.3 Caching de Permisos
```typescript
class PermissionCache {
  private cache = new Map<string, { permissions: string[], expires: number }>();
  
  async getUserPermissions(userId: string): Promise<string[]> {
    const cached = this.cache.get(userId);
    
    if (cached && cached.expires > Date.now()) {
      return cached.permissions;
    }
    
    const permissions = await this.loadPermissionsFromDB(userId);
    
    this.cache.set(userId, {
      permissions,
      expires: Date.now() + (15 * 60 * 1000) // 15 minutos
    });
    
    return permissions;
  }
  
  invalidateUser(userId: string) {
    this.cache.delete(userId);
  }
}
```

## 5. Auditoría de Permisos

### 5.1 Eventos de Auditoría
```typescript
const auditEvents = {
  PERMISSION_CHECK: 'permission.checked',
  PERMISSION_DENIED: 'permission.denied',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REVOKED: 'role.revoked',
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_GRANTED: 'approval.granted',
  APPROVAL_DENIED: 'approval.denied'
};
```

### 5.2 Logging de Verificaciones
```typescript
function logPermissionCheck(userId: string, permission: string, granted: boolean, context?: any) {
  auditLogger.info({
    action: auditEvents.PERMISSION_CHECK,
    userId,
    permission,
    granted,
    context,
    timestamp: new Date().toISOString(),
    ip: context?.ip,
    userAgent: context?.userAgent
  });
}
```

## 6. Matriz de Responsabilidades

### 6.1 Operaciones Críticas y Aprobadores

| Operación | Umbral | Aprobador Requerido | Tiempo Límite |
|-----------|--------|---------------------|---------------|
| Cancelación venta > $5,000 | $5,000 | SUPERVISOR | 24 horas |
| Descuento > 25% | 25% | ADMIN | Inmediato |
| Devolución > $10,000 | $10,000 | ADMIN | 48 horas |
| Ajuste inventario > $20,000 | $20,000 | ADMIN | 72 horas |
| Movimiento efectivo > $50,000 | $50,000 | ADMIN | Inmediato |
| Cambio precio producto | Cualquier | ADMIN | 24 horas |
| Creación usuario | Cualquier | ADMIN | Inmediato |
| Modificación rol usuario | Cualquier | ADMIN | Inmediato |

### 6.2 Escalación Automática
```typescript
const escalationRules = {
  // Si supervisor no responde en 2 horas, escalar a admin
  supervisorApproval: {
    timeout: 2 * 60 * 60 * 1000, // 2 horas
    escalateTo: 'ADMIN'
  },
  
  // Si admin no responde en 24 horas, notificar TI
  adminApproval: {
    timeout: 24 * 60 * 60 * 1000, // 24 horas
    notify: ['IT_SUPPORT']
  }
};
```

Esta matriz de permisos asegura el control de acceso apropiado para cada rol en el sistema POS del Country Club Mérida, manteniendo la seguridad y la eficiencia operativa.
