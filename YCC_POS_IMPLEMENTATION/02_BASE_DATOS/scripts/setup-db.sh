#!/bin/bash

# Script de setup inicial para base de datos YCC POS
# Autor: YCC Development Team
# Fecha: 23 de Febrero 2026

set -e

echo "🗄️ Configurando base de datos YCC POS..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado. Por favor instala PostgreSQL primero."
    echo "📖 Instrucciones de instalación:"
    echo "  Ubuntu/Debian: sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Descargar desde https://www.postgresql.org/download/windows/"
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Por favor instala pnpm primero."
    echo "📦 Instrucciones de instalación:"
    echo "  npm install -g pnpm"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ycc_pos?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
EOF
    echo "✅ Archivo .env creado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
cd packages/database
pnpm run generate

# Crear base de datos si no existe
echo "🗄️ Creando base de datos..."
createdb ycc_pos 2>/dev/null || echo "⚠️  La base de datos ya existe"

# Aplicar migraciones
echo "🔄 Aplicando migraciones..."
pnpm run migrate:dev

# Cargar datos iniciales (seed)
echo "🌱 Cargando datos iniciales..."
pnpm run seed

echo "✅ Setup de base de datos completado exitosamente"
echo ""
echo "📊 Resumen:"
echo "  - Base de datos: ycc_pos"
echo "  - Tablas creadas: Users, Stores, Terminals, Categories, Products, Orders, etc."
echo "  - Datos iniciales: Usuarios, tiendas, productos, categorías"
echo "  - Conexión: PostgreSQL en localhost:5432"
echo ""
echo "🚀 El sistema está listo para empezar el desarrollo:"
