# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy build files from Stage 1 to Nginx default public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx web server
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
