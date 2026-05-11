# Dockerfile para Render.com - YCC POS API Gateway
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@8

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente y configuración
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./

# Generar Prisma Client
RUN npx prisma generate

# Construir aplicación
RUN pnpm run build

# Exponer puerto (Render asigna el puerto dinámicamente)
EXPOSE $PORT

# Comando de inicio
CMD ["node", "dist/index.js"]
