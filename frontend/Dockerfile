# Dockerfile for frontend
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner stage - using Node.js to serve static files
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Install serve for static file serving
RUN npm install -g serve

# Copy built files
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

USER appuser
EXPOSE 3000
ENV PORT 3000
ENV HOST "0.0.0.0"

# Use serve to host static files
CMD ["serve", "-s", "dist", "-l", "3000"]