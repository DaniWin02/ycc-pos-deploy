# 🚀 Despliegue Rápido YCC POS en Vercel

## TL;DR - Despliegue en 5 pasos

1. **Crear archivo .env.production.local** con tus credenciales
2. **Importar en Vercel**: https://vercel.com/new
3. **Configurar variables de entorno** en el dashboard
4. **Desplegar** automáticamente desde GitHub
5. **Ejecutar migraciones** de base de datos

---

## 📋 Checklist de Preparación

### Requisitos Previos
- [ ] Cuenta en Vercel (https://vercel.com)
- [ ] Cuenta en GitHub con el repo subido
- [ ] Base de datos PostgreSQL (Vercel Postgres, Supabase, Railway, etc.)
- [ ] Node.js 18+ y pnpm instalados

### Configuración de Base de Datos

Opciones recomendadas:
1. **Vercel Postgres** (más fácil, integración nativa)
2. **Supabase** (generoso plan gratuito)
3. **Neon** (serverless postgres)
4. **Railway** (simple y rápido)

Crear base de datos y obtener URL de conexión:
```
postgresql://user:password@host:port/database?schema=public
```

---

## 🔧 Configuración de Variables de Entorno

### Variables Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://...` |
| `JWT_SECRET` | Secreto para tokens | `minimo-32-caracteres...` |
| `NODE_ENV` | Entorno | `production` |
| `VITE_API_URL` | URL del API | `https://tu-app.vercel.app/api` |

### Configurar en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable para el entorno Production

---

## 📁 Archivos de Configuración Creados

```
YCC_POS_IMPLEMENTATION/
├── vercel.json              # Configuración principal de Vercel
├── DEPLOYMENT.md            # Guía completa de despliegue
├── .env.production          # Template de variables
├── scripts/
│   └── deploy-vercel.bat    # Script de despliegue (Windows)
├── 04_CORE_POS/
│   └── .env.production      # Config POS
├── 05_KDS_SYSTEM/
│   └── .env.production      # Config KDS
└── 06_ADMIN_PANEL/
    └── .env.production      # Config Admin
```

---

## 🚀 Métodos de Despliegue

### Método 1: GitHub + Vercel (Recomendado)

```bash
# 1. Commit y push
git add .
git commit -m "Configurar despliegue Vercel"
git push origin master

# 2. Importar en Vercel
# Ir a https://vercel.com/new
# Importar: https://github.com/DaniWin02/CountryClubSYS
# Root Directory: YCC_POS_IMPLEMENTATION
# Framework Preset: Other

# 3. Configurar Build Settings:
# Build Command: (ver script en vercel.json)
# Output Directory: 04_CORE_POS/dist
# Install Command: pnpm install
```

### Método 2: Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

### Método 3: Script Batch (Windows)

```bash
cd YCC_POS_IMPLEMENTATION/scripts
./deploy-vercel.bat
```

---

## 🗄️ Migraciones de Base de Datos

Después del primer despliegue:

```bash
# Usando Prisma CLI local con la DB de producción
export DATABASE_URL="postgresql://tu-url-de-produccion"
cd 03_API_GATEWAY
npx prisma migrate deploy
```

O desde Vercel Dashboard:
1. Ve a Functions tab
2. Open Console
3. Ejecuta: `cd 03_API_GATEWAY && npx prisma migrate deploy`

---

## 🔍 Verificación Post-Despliegue

### Endpoints a probar:

```bash
# Health check
curl https://tu-app.vercel.app/api/health

# Login (POST)
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'

# Productos (GET con token)
curl https://tu-app.vercel.app/api/products \
  -H "Authorization: Bearer TU_TOKEN"
```

### URLs de la aplicación:

- 🏠 **Home**: `https://tu-app.vercel.app/`
- 🖥️ **POS**: `https://tu-app.vercel.app/pos`
- 👨‍🍳 **KDS**: `https://tu-app.vercel.app/kds`
- ⚙️ **Admin**: `https://tu-app.vercel.app/admin`
- 🔌 **API**: `https://tu-app.vercel.app/api`

---

## 🛠️ Solución de Problemas Comunes

### Error: "Prisma Client not found"
**Solución**: El build command debe incluir `npx prisma generate`

### Error: "Cannot find module '@/types'"
**Solución**: Verificar tsconfig.json tiene los paths correctos

### Error: "CORS policy"
**Solución**: Configurar CORS_ORIGIN con tu dominio específico

### Error: "Database connection failed"
**Solución**: Verificar DATABASE_URL es correcta y la DB permite conexiones

---

## 📊 Monitoreo y Logs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs en tiempo real**: Functions tab → Logs
- **Analytics**: Habilitar en Settings → Analytics

---

## 🔄 Actualizaciones

Para actualizar el despliegue:

```bash
# Hacer cambios
# Commit y push
git push origin master

# Vercel despliega automáticamente
```

---

## 💰 Costos Estimados (Vercel)

- **Hobby (Gratis)**: 
  - 100GB ancho de banda/mes
  - 1000 builds/mes
  - Serverless Functions: 100GB-horas
  
- **Pro ($20/mes)**: Para producción seria
  - 1TB ancho de banda
  - 4000 builds
  - Mayor tiempo de función

Base de datos (ejemplo Supabase):
- **Gratis**: 500MB, 2M request/mes
- **Pro**: $25/mes

---

## 📞 Soporte y Recursos

- **Docs Vercel**: https://vercel.com/docs
- **Docs Prisma**: https://www.prisma.io/docs
- **GitHub Issues**: https://github.com/DaniWin02/CountryClubSYS/issues

---

## ✅ Checklist Final

Antes de considerar el despliegue "listo":

- [ ] Todos los servicios responden (health checks)
- [ ] Login funciona correctamente
- [ ] Productos se cargan
- [ ] Ventas se procesan y guardan
- [ ] KDS recibe órdenes
- [ ] Admin panel accesible
- [ ] Base de datos persistente
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado de valor default
- [ ] CORS configurado apropiadamente

---

**¡Listo para desplegar! 🚀**
