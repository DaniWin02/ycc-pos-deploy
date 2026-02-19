# Scripts de Desarrollo - Country Club POS

## 📋 Scripts Principales

### Scripts de Desarrollo y Construcción
```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev

# Construir aplicación para producción
npm run build

# Iniciar servidor de producción
npm start

# Construir y analizar tamaño del bundle
npm run analyze
```

### Scripts de Calidad de Código
```bash
# Ejecutar linter
npm run lint

# Corregir automáticamente problemas de linting
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar
npm run format:check

# Verificar tipos TypeScript
npm run type-check
```

### Scripts de Testing
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar tests E2E con Playwright
npm run test:e2e
```

### Scripts de Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Crear y aplicar nueva migración
npm run db:migrate

# Aplicar migraciones en producción
npm run db:deploy

# Resetear base de datos (cuidado: borra datos)
npm run db:reset

# Poblar base de datos con datos iniciales
npm run db:seed

# Abrir Prisma Studio (UI de base de datos)
npm run db:studio

# Sincronizar esquema con base de datos
npm run db:push
```

### Scripts de Docker
```bash
# Iniciar entorno de desarrollo con Docker
npm run docker:dev

# Iniciar entorno de producción con Docker
npm run docker:prod

# Construir imágenes Docker
npm run docker:build

# Limpiar contenedores e imágenes Docker
npm run docker:clean
```

### Scripts de Mantenimiento
```bash
# Limpiar caché y archivos temporales
npm run clean

# Actualizar dependencias
npm run update

# Generar documentación de API
npm run docs:generate
```

---

## 🛠️ Scripts Personalizados

### Script de Backup de Base de Datos
```bash
#!/bin/bash
# scripts/backup-db.sh

set -e

# Configuración
DB_NAME="countryclub_pos"
DB_USER="postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
echo "🔄 Creando backup de base de datos..."
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Comprimir backup
echo "🗜️ Comprimiendo backup..."
gzip $BACKUP_FILE

# Eliminar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completado: ${BACKUP_FILE}.gz"
```

### Script de Restauración de Base de Datos
```bash
#!/bin/bash
# scripts/restore-db.sh

set -e

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <archivo_backup>"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="countryclub_pos"
DB_USER="postgres"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ El archivo $BACKUP_FILE no existe"
    exit 1
fi

# Restaurar backup
echo "🔄 Restaurando base de datos desde $BACKUP_FILE..."

if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | psql -U $DB_USER -h localhost $DB_NAME
else
    psql -U $DB_USER -h localhost $DB_NAME < $BACKUP_FILE
fi

echo "✅ Base de datos restaurada exitosamente"
```

### Script de Despliegue
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Iniciando despliegue de Country Club POS..."

# Variables de entorno
NODE_ENV=${NODE_ENV:-production}
BRANCH=${1:-main}

# Cambiar a la rama correcta
echo "📥 Cambiando a rama $BRANCH..."
git checkout $BRANCH
git pull origin $BRANCH

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --production

# Construir aplicación
echo "🏗️ Construyendo aplicación..."
npm run build

# Ejecutar migraciones de base de datos
echo "🗄️ Ejecutando migraciones..."
npx prisma migrate deploy

# Reiniciar servicios (si usa PM2)
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando servicios con PM2..."
    pm2 restart countryclub-pos
else
    echo "⚠️ PM2 no encontrado. Reinicia manualmente el servidor."
fi

echo "✅ Despliegue completado exitosamente"
```

### Script de Setup de Desarrollo
```bash
#!/bin/bash
# scripts/setup-dev.sh

set -e

echo "🔧 Configurando entorno de desarrollo de Country Club POS..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18+. Versión actual: $(node -v)"
    exit 1
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado. Por favor instala PostgreSQL 14+"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias de Node.js..."
npm install

# Copiar archivo de entorno
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cp .env.example .env.local
    echo "⚠️ Por favor edita .env.local con tus configuraciones"
fi

# Configurar base de datos
echo "🗄️ Configurando base de datos..."
read -p "¿Crear base de datos 'countryclub_pos'? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    createdb countryclub_pos
fi

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
npx prisma migrate dev

# Poblar datos iniciales
echo "🌱 Poblando datos iniciales..."
npx prisma db seed

echo "✅ Entorno de desarrollo configurado exitosamente"
echo "🚀 Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
```

### Script de Limpieza
```bash
#!/bin/bash
# scripts/clean.sh

set -e

echo "🧹 Limpiando proyecto Country Club POS..."

# Limpiar caché de Next.js
echo "🗑️ Limpiando caché de Next.js..."
rm -rf .next

# Limpiar caché de npm
echo "🗑️ Limpiando caché de npm..."
npm cache clean --force

# Limpiar archivos de coverage
echo "🗑️ Limpiando archivos de coverage..."
rm -rf coverage

# Limpiar logs antiguos
echo "🗑️ Limpiando logs antiguos..."
find logs/ -name "*.log" -mtime +30 -delete 2>/dev/null || true

# Limpiar archivos temporales
echo "🗑️ Limpiando archivos temporales..."
find . -name "*.tmp" -delete
find . -name ".DS_Store" -delete

# Opcional: Reinstalar dependencias
read -p "¿Reinstalar dependencias? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Reinstalando dependencias..."
    rm -rf node_modules
    npm install
fi

echo "✅ Limpieza completada"
```

### Script de Health Check
```bash
#!/bin/bash
# scripts/health-check.sh

set -e

echo "🏥 Verificando salud del sistema Country Club POS..."

# Verificar servidor web
echo "🌐 Verificando servidor web..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Servidor web funcionando"
else
    echo "❌ Servidor web no responde"
    exit 1
fi

# Verificar base de datos
echo "🗄️ Verificando base de datos..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ Base de datos funcionando"
else
    echo "❌ Base de datos no responde"
    exit 1
fi

# Verificar Redis (si está configurado)
if [ ! -z "$REDIS_URL" ]; then
    echo "🔴 Verificando Redis..."
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis funcionando"
    else
        echo "❌ Redis no responde"
        exit 1
    fi
fi

# Verificar espacio en disco
echo "💾 Verificando espacio en disco..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ Espacio en disco bajo: ${DISK_USAGE}%"
else
    echo "✅ Espacio en disco adecuado: ${DISK_USAGE}%"
fi

# Verificar uso de memoria
echo "🧠 Verificando uso de memoria..."
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
    echo "⚠️ Uso de memoria alto: ${MEMORY_USAGE}%"
else
    echo "✅ Uso de memoria adecuado: ${MEMORY_USAGE}%"
fi

echo "✅ Verificación de salud completada"
```

---

## 🔄 Scripts de Git Hooks

### Pre-commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

echo "🔍 Ejecitando pre-commit hooks..."

# Ejecutar linting
echo "🔍 Verificando código con ESLint..."
npm run lint

# Formatear código
echo "✨ Formateando código con Prettier..."
npm run format

# Ejecutar tests unitarios
echo "🧪 Ejecutando tests unitarios..."
npm run test:unit

# Verificar tipos TypeScript
echo "📝 Verificando tipos TypeScript..."
npm run type-check

echo "✅ Pre-commit hooks completados"
```

### Pre-push Hook
```bash
#!/bin/bash
# .husky/pre-push

echo "🚀 Ejecutando pre-push hooks..."

# Ejecutar todos los tests
echo "🧪 Ejecutando suite completa de tests..."
npm test

# Verificar construcción
echo "🏗️ Verificando que la aplicación construye correctamente..."
npm run build

echo "✅ Pre-push hooks completados"
```

---

## 📦 Scripts de Package.json Adicionales

```json
{
  "scripts": {
    "setup": "./scripts/setup-dev.sh",
    "backup": "./scripts/backup-db.sh",
    "restore": "./scripts/restore-db.sh",
    "deploy": "./scripts/deploy.sh",
    "clean": "./scripts/clean.sh",
    "health": "./scripts/health-check.sh",
    "db:backup": "./scripts/backup-db.sh",
    "db:restore": "./scripts/restore-db.sh",
    "security:audit": "npm audit && npm audit fix",
    "security:check": "npm audit --audit-level moderate",
    "deps:update": "npm update && npm audit fix",
    "deps:check": "npm outdated",
    "perf:analyze": "ANALYZE=true npm run build",
    "perf:lighthouse": "lhci autorun",
    "docs:build": "typedoc src",
    "docs:serve": "http-server docs -p 8080",
    "release": "semantic-release",
    "prepare": "husky install"
  }
}
```

---

## 🚀 Uso de Scripts

### Flujo de Desarrollo Típico
```bash
# 1. Configurar entorno inicial
npm run setup

# 2. Iniciar desarrollo
npm run dev

# 3. Realizar cambios y commits
git add .
git commit -m "feat: nueva funcionalidad"

# 4. Ejecutar tests antes de push
npm test

# 5. Push a repositorio
git push origin feature/nueva-funcionalidad

# 6. Despliegue a producción
npm run deploy
```

### Mantenimiento Regular
```bash
# Diariamente
npm run health

# Semanalmente
npm run backup
npm run security:audit

# Mensualmente
npm run clean
npm run deps:update
```

Estos scripts automatizan las tareas comunes de desarrollo, mantenimiento y despliegue del sistema POS del Country Club Mérida.
