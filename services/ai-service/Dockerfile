FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache layers
COPY package*.json ./
RUN npm install --production
# Install all dependencies including dev dependencies
RUN npm install

# Add this to your existing Dockerfile
# Sharp requires additional dependencies on Alpine
RUN apk add --no-cache vips-dev build-base

# Copy the rest of the application code
COPY . .

# Make sure the Google application credentials are accessible
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/config/google-credentials.json"

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "dev"]