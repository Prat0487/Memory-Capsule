FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache layers
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Make sure the Google application credentials are accessible
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/config/google-credentials.json"

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "dev"]
