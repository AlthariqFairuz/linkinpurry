FROM node:20-alpine

# Set working directory di container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi
COPY . .

# Expose port 5173 
EXPOSE 5173

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "dev", "--", "--host"]
