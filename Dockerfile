# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist/SitePerso/browser /usr/share/nginx/html
EXPOSE 4200
