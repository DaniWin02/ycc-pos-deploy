@echo off
chcp 65001 >nul
echo ==========================================
echo YCC POS - Despliegue a Vercel
echo ==========================================
echo.

REM Verificar si Vercel CLI está instalado
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI no está instalado.
    echo Instalando Vercel CLI...
    call npm install -g vercel
)

echo ✅ Vercel CLI encontrado
echo.

REM Preguntar por las variables de entorno si no existen
if not exist ..\.env.production.local (
    echo ⚠️  No se encontró .env.production.local
    echo Por favor, configura las variables de entorno en el Vercel Dashboard
echo.
)

echo 🔧 Paso 1: Compilando proyecto...
cd ..

REM Instalar dependencias si no existen
if not exist node_modules (
    echo 📦 Instalando dependencias...
    call pnpm install
)

REM Generar Prisma Client
echo 🔄 Generando Prisma Client...
cd 03_API_GATEWAY
call npx prisma generate
if errorlevel 1 (
    echo ❌ Error generando Prisma Client
    exit /b 1
)

REM Compilar TypeScript
echo 🔄 Compilando TypeScript...
call npx tsc
if errorlevel 1 (
    echo ❌ Error compilando TypeScript
    exit /b 1
)

cd ..

REM Build aplicaciones frontend
echo 🔄 Compilando aplicaciones frontend...

cd 04_CORE_POS
call pnpm build
if errorlevel 1 (
    echo ❌ Error compilando POS
    exit /b 1
)
cd ..

cd 05_KDS_SYSTEM
call pnpm build
if errorlevel 1 (
    echo ❌ Error compilando KDS
    exit /b 1
)
cd ..

cd 06_ADMIN_PANEL
call pnpm build
if errorlevel 1 (
    echo ❌ Error compilando Admin Panel
    exit /b 1
)
cd ..

echo ✅ Compilación completada
echo.

REM Desplegar a Vercel
echo 🚀 Desplegando a Vercel...
call vercel --prod

if errorlevel 1 (
    echo ❌ Error durante el despliegue
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Despliegue completado exitosamente!
echo ==========================================
echo.
echo 📋 Próximos pasos:
echo 1. Configura las variables de entorno en el Dashboard de Vercel
echo 2. Ejecuta las migraciones de Prisma en producción
echo 3. Verifica que todos los endpoints funcionan correctamente
echo.
echo 🌐 URLs después del despliegue:
echo - API: https://tu-dominio.vercel.app/api
echo - POS: https://tu-dominio.vercel.app/pos
echo - KDS: https://tu-dominio.vercel.app/kds
echo - Admin: https://tu-dominio.vercel.app/admin
echo.

pause
