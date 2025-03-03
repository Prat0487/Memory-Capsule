FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
# Add this line after the initial npm install or during the build process
RUN npm install react-icons
RUN npm install react-router-dom
# Install react-toastify for notifications
RUN npm install react-toastify

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3006
CMD ["nginx", "-g", "daemon off;"]
