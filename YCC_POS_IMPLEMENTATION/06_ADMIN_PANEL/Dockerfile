# Multi-stage build for YCC Admin Frontend
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY 06_ADMIN_PANEL/package.json ./06_ADMIN_PANEL/
COPY 06_ADMIN_PANEL/pnpm-lock.yaml ./06_ADMIN_PANEL/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/06_ADMIN_PANEL/node_modules ./06_ADMIN_PANEL/node_modules

# Copy source code
COPY 06_ADMIN_PANEL/src ./06_ADMIN_PANEL/src
COPY 06_ADMIN_PANEL/public ./06_ADMIN_PANEL/public
COPY 06_ADMIN_PANEL/vite.config.ts ./06_ADMIN_PANEL/
COPY 06_ADMIN_PANEL/tsconfig.json ./06_ADMIN_PANEL/
COPY 06_ADMIN_PANEL/index.html ./06_ADMIN_PANEL/
COPY 06_ADMIN_PANEL/package.json ./06_ADMIN_PANEL/

# Build application
WORKDIR /app/06_ADMIN_PANEL
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY 06_ADMIN_PANEL/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/06_ADMIN_PANEL/dist /usr/share/nginx/html

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
