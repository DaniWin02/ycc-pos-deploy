# Ejemplos de Request/Response - Country Club POS API

## 1. Autenticación

### 1.1 Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "jcajero01",
  "password": "Password123!",
  "terminal_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "username": "jcajero01",
      "email": "juan.cajero@countryclubmerida.com",
      "first_name": "Juan",
      "last_name": "Cajero",
      "active": true,
      "roles": ["CASHIER"],
      "permissions": [
        "sales.create",
        "sales.read",
        "payments.create",
        "shifts.open"
      ],
      "created_at": "2026-01-15T10:30:00.000Z",
      "updated_at": "2026-02-10T15:45:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMTAwIiwiaWF0IjoxNzM5OTk0NjAwLCJleHAiOjE3Mzk5OTU1MDB9.signature",
    "refresh_token": "rt_550e8400-e29b-41d4-a716-446655440100_abc123def456",
    "expires_in": 900
  },
  "meta": {
    "timestamp": "2026-02-19T10:30:00.000Z",
    "version": "v1",
    "requestId": "req_1234567890"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  },
  "meta": {
    "timestamp": "2026-02-19T10:30:00.000Z",
    "version": "v1",
    "requestId": "req_1234567891"
  }
}
```

### 1.2 Refresh Token

**Request:**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "rt_550e8400-e29b-41d4-a716-446655440100_abc123def456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMTAwIiwiaWF0IjoxNzM5OTk0NjAwLCJleHAiOjE3Mzk5OTU1MDB9.newsignature",
    "expires_in": 900
  },
  "meta": {
    "timestamp": "2026-02-19T10:35:00.000Z",
    "version": "v1",
    "requestId": "req_1234567892"
  }
}
```

## 2. Ventas

### 2.1 Crear Venta

**Request:**
```http
POST /api/v1/sales
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440002

{
  "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
  "member_id": "550e8400-e29b-41d4-a716-446655440200",
  "notes": "Cliente preferencial",
  "lines": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440300",
      "quantity": 2,
      "unit_price": 220.00,
      "modifiers": {
        "sin_cebolla": true,
        "extra_queso": false
      },
      "notes": "Sin cebolla"
    },
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440301",
      "quantity": 3,
      "unit_price": 35.00
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": 458.20
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "folio": "C1-000123",
    "status": "PAID",
    "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
    "shift_id": "550e8400-e29b-41d4-a716-446655440500",
    "member_id": "550e8400-e29b-41d4-a716-446655440200",
    "subtotal": 395.00,
    "tax_amount": 63.20,
    "discount_amount": 0.00,
    "total_amount": 458.20,
    "tip_amount": 0.00,
    "notes": "Cliente preferencial",
    "created_at": "2026-02-19T10:45:00.000Z",
    "updated_at": "2026-02-19T10:45:00.000Z",
    "paid_at": "2026-02-19T10:45:00.000Z",
    "voided_at": null,
    "void_reason": null
  },
  "meta": {
    "timestamp": "2026-02-19T10:45:00.000Z",
    "version": "v1",
    "requestId": "req_1234567893"
  }
}
```

### 2.2 Listar Ventas

**Request:**
```http
GET /api/v1/sales?page=1&limit=20&status=PAID&date_from=2026-02-19T00:00:00.000Z&date_to=2026-02-19T23:59:59.999Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440400",
      "folio": "C1-000123",
      "status": "PAID",
      "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
      "shift_id": "550e8400-e29b-41d4-a716-446655440500",
      "member_id": "550e8400-e29b-41d4-a716-446655440200",
      "subtotal": 395.00,
      "tax_amount": 63.20,
      "discount_amount": 0.00,
      "total_amount": 458.20,
      "tip_amount": 0.00,
      "notes": "Cliente preferencial",
      "created_at": "2026-02-19T10:45:00.000Z",
      "updated_at": "2026-02-19T10:45:00.000Z",
      "paid_at": "2026-02-19T10:45:00.000Z",
      "voided_at": null,
      "void_reason": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-02-19T11:00:00.000Z",
    "version": "v1",
    "requestId": "req_1234567894"
  }
}
```

### 2.3 Obtener Detalle de Venta

**Request:**
```http
GET /api/v1/sales/550e8400-e29b-41d4-a716-446655440400
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sale": {
      "id": "550e8400-e29b-41d4-a716-446655440400",
      "folio": "C1-000123",
      "status": "PAID",
      "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
      "shift_id": "550e8400-e29b-41d4-a716-446655440500",
      "member_id": "550e8400-e29b-41d4-a716-446655440200",
      "subtotal": 395.00,
      "tax_amount": 63.20,
      "discount_amount": 0.00,
      "total_amount": 458.20,
      "tip_amount": 0.00,
      "notes": "Cliente preferencial",
      "created_at": "2026-02-19T10:45:00.000Z",
      "updated_at": "2026-02-19T10:45:00.000Z",
      "paid_at": "2026-02-19T10:45:00.000Z",
      "voided_at": null,
      "void_reason": null
    },
    "lines": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440401",
        "sale_id": "550e8400-e29b-41d4-a716-446655440400",
        "product_id": "550e8400-e29b-41d4-a716-446655440300",
        "quantity": 2,
        "unit_price": 220.00,
        "tax_rate": 0.16,
        "line_total": 440.00,
        "modifiers": {
          "sin_cebolla": true,
          "extra_queso": false
        },
        "notes": "Sin cebolla",
        "created_at": "2026-02-19T10:45:00.000Z",
        "updated_at": "2026-02-19T10:45:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440402",
        "sale_id": "550e8400-e29b-41d4-a716-446655440400",
        "product_id": "550e8400-e29b-41d4-a716-446655440301",
        "quantity": 3,
        "unit_price": 35.00,
        "tax_rate": 0.00,
        "line_total": 105.00,
        "modifiers": null,
        "notes": null,
        "created_at": "2026-02-19T10:45:00.000Z",
        "updated_at": "2026-02-19T10:45:00.000Z"
      }
    ],
    "payments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440403",
        "sale_id": "550e8400-e29b-41d4-a716-446655440400",
        "method": "CASH",
        "amount": 458.20,
        "reference": null,
        "authorization_code": null,
        "status": "CAPTURED",
        "captured_at": "2026-02-19T10:45:00.000Z",
        "created_at": "2026-02-19T10:45:00.000Z",
        "updated_at": "2026-02-19T10:45:00.000Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-19T11:05:00.000Z",
    "version": "v1",
    "requestId": "req_1234567895"
  }
}
```

### 2.4 Cancelar Venta

**Request:**
```http
DELETE /api/v1/sales/550e8400-e29b-41d4-a716-446655440400
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "reason": "Error en captura de productos"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "folio": "C1-000123",
    "status": "VOIDED",
    "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
    "shift_id": "550e8400-e29b-41d4-a716-446655440500",
    "member_id": "550e8400-e29b-41d4-a716-446655440200",
    "subtotal": 395.00,
    "tax_amount": 63.20,
    "discount_amount": 0.00,
    "total_amount": 458.20,
    "tip_amount": 0.00,
    "notes": "Cliente preferencial",
    "created_at": "2026-02-19T10:45:00.000Z",
    "updated_at": "2026-02-19T11:10:00.000Z",
    "paid_at": "2026-02-19T10:45:00.000Z",
    "voided_at": "2026-02-19T11:10:00.000Z",
    "void_reason": "Error en captura de productos"
  },
  "meta": {
    "timestamp": "2026-02-19T11:10:00.000Z",
    "version": "v1",
    "requestId": "req_1234567896"
  }
}
```

## 3. Productos

### 3.1 Listar Productos

**Request:**
```http
GET /api/v1/products?page=1&limit=20&search=agua&active=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440301",
      "sku": "AGUA600",
      "name": "Agua mineral 600ml",
      "description": "Agua purificada en botella de 600ml",
      "category_id": "550e8400-e29b-41d4-a716-446655440600",
      "price": 35.00,
      "cost": 18.50,
      "tax_rate": 0.00,
      "track_inventory": true,
      "active": true,
      "created_at": "2026-01-10T09:00:00.000Z",
      "updated_at": "2026-02-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-02-19T11:15:00.000Z",
    "version": "v1",
    "requestId": "req_1234567897"
  }
}
```

### 3.2 Obtener Producto

**Request:**
```http
GET /api/v1/products/550e8400-e29b-41d4-a716-446655440301
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440301",
    "sku": "AGUA600",
    "name": "Agua mineral 600ml",
    "description": "Agua purificada en botella de 600ml",
    "category_id": "550e8400-e29b-41d4-a716-446655440600",
    "price": 35.00,
    "cost": 18.50,
    "tax_rate": 0.00,
    "track_inventory": true,
    "active": true,
    "created_at": "2026-01-10T09:00:00.000Z",
    "updated_at": "2026-02-15T14:30:00.000Z"
  },
  "meta": {
    "timestamp": "2026-02-19T11:20:00.000Z",
    "version": "v1",
    "requestId": "req_1234567898"
  }
}
```

## 4. Socios

### 4.1 Buscar Socios

**Request:**
```http
GET /api/v1/members?q=Juan&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "member_number": "M001234",
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@email.com",
      "phone": "+52-999-123-4567",
      "status": "ACTIVE",
      "join_date": "2020-03-15",
      "birth_date": "1985-06-20",
      "created_at": "2020-03-15T10:00:00.000Z",
      "updated_at": "2026-02-18T16:30:00.000Z",
      "accounts": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440201",
          "name": "Principal",
          "type": "CREDIT",
          "credit_limit": 5000.00,
          "current_balance": 1250.75,
          "active": true
        }
      ]
    }
  ],
  "meta": {
    "timestamp": "2026-02-19T11:25:00.000Z",
    "version": "v1",
    "requestId": "req_1234567899"
  }
}
```

### 4.2 Obtener Socio

**Request:**
```http
GET /api/v1/members/550e8400-e29b-41d4-a716-446655440200
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "member_number": "M001234",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "+52-999-123-4567",
    "status": "ACTIVE",
    "join_date": "2020-03-15",
    "birth_date": "1985-06-20",
    "created_at": "2020-03-15T10:00:00.000Z",
    "updated_at": "2026-02-18T16:30:00.000Z",
    "accounts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440201",
        "name": "Principal",
        "type": "CREDIT",
        "credit_limit": 5000.00,
        "current_balance": 1250.75,
        "active": true
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440202",
        "name": "Familia",
        "type": "CREDIT",
        "credit_limit": 2000.00,
        "current_balance": 450.00,
        "active": true
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-19T11:30:00.000Z",
    "version": "v1",
    "requestId": "req_1234567900"
  }
}
```

## 5. Turnos

### 5.1 Abrir Turno

**Request:**
```http
POST /api/v1/shifts
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
  "opening_float": 2000.00
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440500",
    "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
    "opened_by_user_id": "550e8400-e29b-41d4-a716-446655440100",
    "closed_by_user_id": null,
    "status": "OPEN",
    "opening_float": 2000.00,
    "closing_float": null,
    "opened_at": "2026-02-19T09:00:00.000Z",
    "closed_at": null,
    "notes": null
  },
  "meta": {
    "timestamp": "2026-02-19T09:00:00.000Z",
    "version": "v1",
    "requestId": "req_1234567901"
  }
}
```

### 5.2 Cerrar Turno

**Request:**
```http
POST /api/v1/shifts/550e8400-e29b-41d4-a716-446655440500/close
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "closing_float": 3456.80,
  "notes": "Cierre normal del día"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440500",
    "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
    "opened_by_user_id": "550e8400-e29b-41d4-a716-446655440100",
    "closed_by_user_id": "550e8400-e29b-41d4-a716-446655440101",
    "status": "CLOSED",
    "opening_float": 2000.00,
    "closing_float": 3456.80,
    "opened_at": "2026-02-19T09:00:00.000Z",
    "closed_at": "2026-02-19T18:30:00.000Z",
    "notes": "Cierre normal del día"
  },
  "meta": {
    "timestamp": "2026-02-19T18:30:00.000Z",
    "version": "v1",
    "requestId": "req_1234567902"
  }
}
```

## 6. Sincronización Offline

### 6.1 Bootstrap Datos

**Request:**
```http
GET /api/v1/sync/bootstrap?since=2026-02-19T00:00:00.000Z
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "server_time": "2026-02-19T12:00:00.000Z",
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440301",
        "sku": "AGUA600",
        "name": "Agua mineral 600ml",
        "price": 35.00,
        "tax_rate": 0.00,
        "active": true,
        "updated_at": "2026-02-15T14:30:00.000Z"
      }
    ],
    "members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "member_number": "M001234",
        "first_name": "Juan",
        "last_name": "Pérez",
        "status": "ACTIVE",
        "updated_at": "2026-02-18T16:30:00.000Z"
      }
    ],
    "terminals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "code": "CAJA01",
        "name": "Caja Principal",
        "area_id": "550e8400-e29b-41d4-a716-446655440700",
        "active": true
      }
    ],
    "areas": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440700",
        "code": "REST",
        "name": "Restaurante",
        "active": true
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-19T12:00:00.000Z",
    "version": "v1",
    "requestId": "req_1234567903"
  }
}
```

### 6.2 Enviar Eventos Offline

**Request:**
```http
POST /api/v1/sync/outbox
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440800

{
  "events": [
    {
      "id": "evt_550e8400-e29b-41d4-a716-446655440801",
      "type": "SALE_CREATED",
      "occurred_at": "2026-02-19T11:45:00.000Z",
      "terminal_id": "550e8400-e29b-41d4-a716-446655440001",
      "payload": {
        "sale": {
          "id": "550e8400-e29b-41d4-a716-446655440401",
          "folio": "C1-000124",
          "total_amount": 125.50,
          "member_id": "550e8400-e29b-41d4-a716-446655440200"
        },
        "lines": [
          {
            "product_id": "550e8400-e29b-41d4-a716-446655440301",
            "quantity": 1,
            "unit_price": 35.00
          }
        ],
        "payments": [
          {
            "method": "CASH",
            "amount": 125.50
          }
        ]
      }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accepted": [
      {
        "eventId": "evt_550e8400-e29b-41d4-a716-446655440801",
        "status": "OK"
      }
    ],
    "rejected": []
  },
  "meta": {
    "timestamp": "2026-02-19T12:05:00.000Z",
    "version": "v1",
    "requestId": "req_1234567904"
  }
}
```

## 7. Errores Comunes

### 7.1 Error de Validación

**Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "quantity",
        "value": -2,
        "constraint": "must be greater than 0"
      },
      {
        "field": "email",
        "value": "invalid-email",
        "constraint": "must be a valid email address"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-19T12:10:00.000Z",
    "version": "v1",
    "requestId": "req_1234567905"
  }
}
```

### 7.2 Recurso No Encontrado

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Sale not found"
  },
  "meta": {
    "timestamp": "2026-02-19T12:15:00.000Z",
    "version": "v1",
    "requestId": "req_1234567906"
  }
}
```

### 7.3 Error de Negocio

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot void paid sale older than 24 hours without supervisor approval"
  },
  "meta": {
    "timestamp": "2026-02-19T12:20:00.000Z",
    "version": "v1",
    "requestId": "req_1234567907"
  }
}
```

## 8. Headers Importantes

### 8.1 Headers de Request

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440002
X-Request-ID: req_1234567890
```

### 8.2 Headers de Response

```http
Content-Type: application/json
X-Request-ID: req_1234567890
X-Rate-Limit-Remaining: 95
Cache-Control: no-cache
```

Estos ejemplos cubren los casos más comunes de uso de la API del POS del Country Club Mérida.
