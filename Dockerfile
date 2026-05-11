# Dockerfile para Render.com - YCC POS API Gateway
# Este archivo está en la raíz para que Render lo encuentre

FROM node:20-alpine

WORKDIR /app

# Instalar pnpm v9 (compatible con Node.js 20)
RUN npm install -g pnpm@9

# Copiar archivos de dependencias desde el subdirectorio
COPY YCC_POS_IMPLEMENTATION/03_API_GATEWAY/package.json YCC_POS_IMPLEMENTATION/03_API_GATEWAY/pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente y configuración
COPY YCC_POS_IMPLEMENTATION/03_API_GATEWAY/src ./src
COPY YCC_POS_IMPLEMENTATION/03_API_GATEWAY/prisma ./prisma
COPY YCC_POS_IMPLEMENTATION/03_API_GATEWAY/tsconfig.json ./

# Generar Prisma Client
RUN npx prisma generate

# Construir aplicación
RUN pnpm run build

# Exponer puerto (Render asigna el puerto dinámicamente)
EXPOSE $PORT

# Comando de inicio
CMD ["node", "dist/index.js"]
