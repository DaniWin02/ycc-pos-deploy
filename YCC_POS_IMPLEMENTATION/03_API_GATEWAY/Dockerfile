# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY 03_API_GATEWAY/package.json ./03_API_GATEWAY/
COPY 03_API_GATEWAY/pnpm-lock.yaml ./03_API_GATEWAY/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/03_API_GATEWAY/node_modules ./03_API_GATEWAY/node_modules

# Copy source code
COPY 03_API_GATEWAY/src ./03_API_GATEWAY/src
COPY 03_API_GATEWAY/prisma ./03_API_GATEWAY/prisma
COPY 03_API_GATEWAY/tsconfig.json ./03_API_GATEWAY/
COPY 03_API_GATEWAY/package.json ./03_API_GATEWAY/

# Generate Prisma client
WORKDIR /app/03_API_GATEWAY
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Install pnpm
RUN npm install -g pnpm@8

# Copy built application
COPY --from=builder /app/03_API_GATEWAY/dist ./dist
COPY --from=builder /app/03_API_GATEWAY/prisma ./prisma
COPY --from=builder /app/03_API_GATEWAY/node_modules ./node_modules
COPY --from=builder /app/03_API_GATEWAY/package.json ./package.json

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]
