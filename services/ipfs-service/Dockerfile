FROM node:16-alpine

WORKDIR /app

# Install dependencies for file handling
COPY package*.json ./
RUN npm install

COPY . .

# IPFS service runs on port 3002
EXPOSE 3002

CMD ["npm", "run", "dev"]
