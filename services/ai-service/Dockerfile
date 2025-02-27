FROM node:16-alpine

WORKDIR /app

# Install dependencies including AI libraries
COPY package*.json ./
RUN npm install

COPY . .

# AI service runs on port 3003
EXPOSE 3003

CMD ["npm", "run", "dev"]
