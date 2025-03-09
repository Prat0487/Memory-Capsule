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

# Production stage - using a SIMPLER approach
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx config
RUN echo 'server { \
    listen $PORT; \
    root /usr/share/nginx/html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.template

# Use shell form with proper escaping
CMD /bin/sh -c '\
    export PORT="${PORT:-3006}"; \
    envsubst < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf; \
    cat /etc/nginx/conf.d/default.conf; \
    echo "Starting nginx..."; \
    nginx -g "daemon off;"'