# Multi-stage build for YCC KDS Frontend
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY 05_KDS_SYSTEM/package.json ./05_KDS_SYSTEM/
COPY 05_KDS_SYSTEM/pnpm-lock.yaml ./05_KDS_SYSTEM/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/05_KDS_SYSTEM/node_modules ./05_KDS_SYSTEM/node_modules

# Copy source code
COPY 05_KDS_SYSTEM/src ./05_KDS_SYSTEM/src
COPY 05_KDS_SYSTEM/public ./05_KDS_SYSTEM/public
COPY 05_KDS_SYSTEM/vite.config.ts ./05_KDS_SYSTEM/
COPY 05_KDS_SYSTEM/tsconfig.json ./05_KDS_SYSTEM/
COPY 05_KDS_SYSTEM/index.html ./05_KDS_SYSTEM/
COPY 05_KDS_SYSTEM/package.json ./05_KDS_SYSTEM/

# Build application
WORKDIR /app/05_KDS_SYSTEM
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY 05_KDS_SYSTEM/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/05_KDS_SYSTEM/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup --system --gid 1001 nginx && \
    adduser --system --uid 1001 --ingroup nginx nginx

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
