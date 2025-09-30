# Use Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build TypeScript (adjust if you use tsc or tsup)
RUN npm run build

# Expose API port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
