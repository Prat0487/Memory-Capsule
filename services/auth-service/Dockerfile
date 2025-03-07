FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
# Corrected command for Alpine Linux
RUN apk add --no-cache python3 make g++ gcc
COPY . .

# Auth service runs on port 3004
EXPOSE 3004

CMD ["npm", "run", "dev"]
