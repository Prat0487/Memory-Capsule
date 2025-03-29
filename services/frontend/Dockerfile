FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
# Install all required dependencies explicitly
RUN npm install --save @mui/material @mui/icons-material axios ethers framer-motion react react-dom react-icons react-router-dom react-toastify
COPY . .
ARG VITE_API_URL=http://localhost:3000
ARG VITE_AUTH_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
RUN npm run build

FROM nginx:alpine

# Copy the built app
COPY ./dist /usr/share/nginx/html

# Create a simple nginx config
RUN echo 'server { \
    listen 3006; \
    root /usr/share/nginx/html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://memory-service:3000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3006

CMD ["nginx", "-g", "daemon off;"]