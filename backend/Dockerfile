# Use Node.js 20 Alpine as base
FROM node:20-alpine

# Create app directory and set permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Clean install dependencies
RUN npm ci

# Copy source files
COPY --chown=node:node . .

# Add healthcheck
# Diperlukan untuk stress test di Github Actions
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Gunakan nama variable sesuai spesifikasi
ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_HOST=postgres
ENV REDIS_URL=redis://redis:6379

EXPOSE 3000

# Untuk TypeScript & build:
RUN npm run build

# Jika menggunakan TypeScript & build:
CMD ["node", "dist/index.js"]
# CMD ["node", "index.js"]