FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install node-fetch@2 multer && npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]