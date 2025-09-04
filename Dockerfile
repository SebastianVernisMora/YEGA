# syntax=docker/dockerfile:1

# --- Frontend build stage ---
FROM node:20-alpine AS frontend_builder
WORKDIR /app/frontend

# Install frontend deps
COPY frontend/package*.json ./
RUN npm ci

# Build frontend
COPY frontend/ ./
RUN npm run build

# --- Backend deps stage ---
FROM node:20-alpine AS backend_deps
WORKDIR /app/backend

# Install backend deps (production only)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# --- Production image ---
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy backend source code
COPY backend ./backend
# Copy backend production node_modules
COPY --from=backend_deps /app/backend/node_modules ./backend/node_modules

# Copy built frontend (served by Express in production)
COPY --from=frontend_builder /app/frontend/dist ./frontend/dist

# Prepare runtime dirs (uploads for persistent files)
RUN mkdir -p /app/backend/uploads && \
    chown -R node:node /app

# Use non-root user for security
USER node

# App exposes 5000 (PORT can be overridden)
EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
