# Guía de Despliegue YCC POS en Vercel

## Preparación

### 1. Configurar Base de Datos

Necesitas una base de datos PostgreSQL. Opciones:
- **Vercel Postgres** (recomendado): Integrado con Vercel
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

Obtén la URL de conexión y configúrala en las variables de entorno.

### 2. Variables de Entorno Requeridas

#### Para API Gateway (03_API_GATEWAY):
```
DATABASE_URL="postgresql://usuario:password@host:puerto/database?schema=public"
JWT_SECRET="tu-jwt-secret-super-seguro-minimo-32-caracteres"
PORT=3004
NODE_ENV=production
CORS_ORIGIN="*"
```

#### Para Frontend Apps (04_CORE_POS, 05_KDS_SYSTEM, 06_ADMIN_PANEL):
```
VITE_API_URL="https://tu-dominio.vercel.app/api"
VITE_WS_URL="wss://tu-dominio.vercel.app"
```

### 3. Configurar Vercel CLI (Opcional)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar desde CLI
vercel --prod
```

## Despliegue paso a paso

### Opción A: Despliegue desde GitHub (Recomendado)

1. **Push a GitHub**
   ```bash
   git add .
   git commit -m "Preparar para despliegue Vercel"
   git push origin master
   ```

2. **Importar en Vercel**
   - Ve a https://vercel.com/new
   - Importa tu repositorio: `https://github.com/DaniWin02/CountryClubSYS`
   - Selecciona el framework: **Other** (otros)
   - Configura el directorio raíz: `YCC_POS_IMPLEMENTATION`

3. **Configurar Variables de Entorno**
   En el dashboard de Vercel, ve a Settings → Environment Variables:
   
   | Variable | Valor | Entorno |
   |----------|-------|---------|
   | DATABASE_URL | postgresql://... | Production |
   | JWT_SECRET | tu-secreto-jwt | Production |
   | NODE_ENV | production | Production |

4. **Configurar Build Settings**
   - Build Command: `cd 03_API_GATEWAY && npx prisma generate && npx tsc && cd ../04_CORE_POS && pnpm build && cd ../05_KDS_SYSTEM && pnpm build && cd ../06_ADMIN_PANEL && pnpm build`
   - Output Directory: `04_CORE_POS/dist`
   - Install Command: `pnpm install`

5. **Deploy**
   - Click en "Deploy"
   - Espera a que el build complete

### Opción B: Despliegue Manual con CLI

```bash
# Desde la carpeta YCC_POS_IMPLEMENTATION
vercel --prod

# Seguir las instrucciones interactivas
# Configurar las variables de entorno cuando se soliciten
```

## Post-Despliegue

### 1. Ejecutar Migraciones de Base de Datos

Después del primer despliegue, ejecuta las migraciones:

```bash
# Localmente con la URL de producción
export DATABASE_URL="tu-url-de-produccion"
cd 03_API_GATEWAY
npx prisma migrate deploy
```

O desde Vercel Dashboard → Functions → Consola:
```bash
cd 03_API_GATEWAY && npx prisma migrate deploy
```

### 2. Crear Usuario Admin

```bash
cd 03_API_GATEWAY
npx tsx prisma/seed.ts
```

O ejecuta el script SQL en tu base de datos:
```sql
-- Ver archivo 03_API_GATEWAY/insert-admin.sql
```

### 3. Verificar Endpoints

- API Health: `https://tu-dominio.vercel.app/api/health`
- POS: `https://tu-dominio.vercel.app/pos`
- KDS: `https://tu-dominio.vercel.app/kds`
- Admin: `https://tu-dominio.vercel.app/admin`

## Solución de Problemas

### Error: "Prisma Client not found"

Añade al build command:
```bash
cd 03_API_GATEWAY && npx prisma generate && npx tsc
```

### Error: "Cannot find module"

Verifica que el install command incluya todas las dependencias:
```bash
pnpm install
```

### Error: "Build failed"

1. Verificar que los scripts de build en cada package.json funcionan localmente
2. Revisar logs en Vercel Dashboard → Deployments → [Build]

### Error CORS

Las cabeceras CORS ya están configuradas en `vercel.json`. Si necesitas cambiar el origen:
```json
{
  "source": "/api/(.*)",
  "headers": [
    {
      "key": "Access-Control-Allow-Origin",
      "value": "https://tu-dominio-especifico.com"
    }
  ]
}
```

## Estructura de URLs después del despliegue

```
https://tu-proyecto.vercel.app/
├── /api/*           → API Gateway (Express)
├── /pos             → Terminal POS
├── /pos/*           → Assets del POS
├── /kds             → Kitchen Display System
├── /kds/*           → Assets del KDS
├── /admin           → Panel de Administración
└── /admin/*         → Assets del Admin
```

## Actualizaciones

Para actualizar el despliegue:

1. Hacer cambios en local
2. Push a GitHub: `git push origin master`
3. Vercel despliega automáticamente (si está configurado)

O manualmente:
```bash
vercel --prod
```

## Seguridad

1. **Nunca** comiteas el archivo `.env` con credenciales reales
2. Usa siempre HTTPS en producción
3. Configura CORS apropiadamente (no uses `*` en producción real)
4. Rotar JWT_SECRET regularmente
5. Usar contraseñas fuertes para la base de datos

## Soporte

- Documentación Vercel: https://vercel.com/docs
- Documentación Prisma: https://www.prisma.io/docs
- Issues del proyecto: https://github.com/DaniWin02/CountryClubSYS/issues
