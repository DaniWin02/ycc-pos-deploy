#!/bin/bash

# Script para cargar datos iniciales en la base de datos YCC POS
# Autor: YCC Development Team
# Fecha: 23 de Febrero 2026

set -e

echo "🌱 Cargando datos iniciales en YCC POS..."

# Verificar si la base de datos existe
if ! psql -lqt | grep -q "ycc_pos"; then
    echo "❌ La base de datos 'ycc_pos' no existe."
    echo "Por favor ejecuta primero el script setup-db.sh"
    exit 1
fi

# Ejecutar el seed de Prisma
echo "🔄 Ejecutando seed de datos..."
cd packages/database
pnpm run seed

echo "✅ Datos iniciales cargados exitosamente"
echo ""
echo "📊 Datos cargados:"
echo "  - 3 usuarios (admin, cajero, cocinero)"
echo "  - 1 tienda (Country Club Mérida)"
echo "  - 2 terminales (Principal, Terraza)"
echo "  - 3 categorías (Bebidas, Comidas, Postres)"
echo "  - 3 productos (Coca Cola, Hamburguesa, Papas)"
echo "  - 2 ingredientes (Carne de res, Papas)"
echo "  - 2 grupos de modificadores (Adicionales, Salsas)"
echo "  - 4 modificadores (Queso, Tocino, Mayonesa, Kétchup)"
echo ""
echo "🚀 El sistema está listo para desarrollo con datos de prueba."
