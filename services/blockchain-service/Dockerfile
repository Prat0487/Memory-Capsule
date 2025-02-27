FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Blockchain service runs on port 3001
EXPOSE 3001

CMD ["npm", "run", "dev"]
