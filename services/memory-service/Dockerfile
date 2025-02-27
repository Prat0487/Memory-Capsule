FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Memory service typically runs on port 3000
EXPOSE 3000

# Use nodemon in development for auto-reloading
CMD ["npm", "run", "dev"]
