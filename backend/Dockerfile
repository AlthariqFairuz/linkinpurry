FROM node:20-alpine

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# COPY ./.env.example ./.env

# Install dependencies
RUN npm install

# # Copy prisma schema
# COPY prisma ./prisma/

# # Generate Prisma Client
# RUN npx prisma generate

# Copy application code
# COPY . . Biar bisa hot reload

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev", "build"]