FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Auth service runs on port 3004
EXPOSE 3004

CMD ["npm", "run", "dev"]
