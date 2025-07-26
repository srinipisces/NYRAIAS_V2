# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the backend code
COPY . .

# Expose the backend port
EXPOSE 8000

# Start the Express server
CMD ["node", "server.js"]
