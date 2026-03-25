# � YCC POS - Código de Administrador

## 🔐 Sistema de Autenticación

El POS utiliza un sistema de PIN de 4 dígitos para el acceso de administrador. Solo hay un código válido para acceder al sistema.

---

## 📋 Código de Acceso

| PIN | Rol | Usuario | Permisos | Descripción |
|-----|-----|---------|----------|-------------|
| **9999** | ADMIN | Administrador | `sell`, `view_reports`, `manage_cash`, `override_prices`, `manage_users`, `system_config` | Acceso completo al sistema |

---

## 🔑 Detalles de Permisos

### **sell** 💰
- Realizar ventas
- Procesar pagos
- Imprimir tickets
- Ver historial de ventas

### **view_reports** 📊
- Acceder a reportes básicos
- Ver resumen de ventas del día
- Estadísticas simples

### **manage_cash** 💵
- Abrir y cerrar caja
- Realizar cortes de caja (Corte Z)
- Gestionar fondos iniciales
- Ver reportes de caja

### **override_prices** ✏️
- Modificar precios de productos
- Aplicar descuentos
- Cambiar montos en ventas

### **manage_users** 👥
- Gestionar usuarios del sistema
- Asignar roles y permisos
- Ver actividad de usuarios

### **system_config** ⚙️
- Configuración del sistema
- Parámetros generales
- Mantenimiento del sistema

---

## 🚀 Flujo de Acceso

1. **Ingresar PIN** `9999` de 4 dígitos
2. **Sistema autentica** como Administrador
3. **Abre modal de caja** si no hay sesión activa
4. **Accede al POS** con todos los permisos

---

## 📱 Uso del Sistema

### **Acceso Completo:**
- Todas las funcionalidades del sistema disponibles
- Gestión completa de productos y categorías
- Operaciones de caja y corte de caja
- Configuración del sistema
- Reportes y análisis

### **Administrador:**
- Mantenimiento del sistema
- Configuración general
- Acceso completo a todas las áreas

---

## 🔒 Seguridad

- El PIN es de 4 dígitos para facilitar el acceso rápido
- La sesión guarda el usuario y permisos en sessionStorage
- El sistema registra todas las acciones del administrador
- El código puede ser modificado en producción

---

## ⚠️ Notas Importantes

- **PIN 9999 (Admin)** es el único código válido
- Acceso completo a todas las funcionalidades
- Los datos de usuario se persisten durante la sesión
- Al cerrar caja, se limpia la sesión del usuario
- Cualquier otro código será rechazado con mensaje de error

---

## 🔄 Cambio de Código

Para producción, se recomienda:
1. Cambiar el PIN por defecto `9999`
2. Asignar un código único y seguro
3. Implementar política de rotación de PINs
4. Configurar autenticación biométrica adicional

---

**📅 Última actualización:** 20 de Marzo de 2026  
**👤 Actualizado por:** Sistema YCC POS  
**🔐 Versión:** 1.0.0
