FROM node:20-alpine

RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

COPY ./.env.example ./.env

# Install dependencies
RUN npm install

# # Copy prisma schema
# COPY prisma ./prisma/

# # Generate Prisma Client
# RUN npx prisma generate

# Copy application code
COPY . . 

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev-no-migrate"]