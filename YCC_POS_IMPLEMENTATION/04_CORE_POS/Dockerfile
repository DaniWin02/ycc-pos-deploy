# Multi-stage build for YCC POS Frontend
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY 04_CORE_POS/package.json ./04_CORE_POS/
COPY 04_CORE_POS/pnpm-lock.yaml ./04_CORE_POS/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/04_CORE_POS/node_modules ./04_CORE_POS/node_modules

# Copy source code
COPY 04_CORE_POS/src ./04_CORE_POS/src
COPY 04_CORE_POS/public ./04_CORE_POS/public
COPY 04_CORE_POS/vite.config.ts ./04_CORE_POS/
COPY 04_CORE_POS/tsconfig.json ./04_CORE_POS/
COPY 04_CORE_POS/index.html ./04_CORE_POS/
COPY 04_CORE_POS/package.json ./04_CORE_POS/

# Build application
WORKDIR /app/04_CORE_POS
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/04_CORE_POS/dist /usr/share/nginx/html

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
