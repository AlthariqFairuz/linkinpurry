FROM node:20-alpine

# Set working directory di container
WORKDIR /app/frontend

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi
# COPY . . Biar bisa hot reload

# Set permission to 777, grant full access to the assets folder
RUN mkdir -p /app/frontend/src/assets
RUN chmod -R 777 /app/frontend/src/assets

# Expose port 5173 
EXPOSE 5173

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "dev", "--", "--host"]
