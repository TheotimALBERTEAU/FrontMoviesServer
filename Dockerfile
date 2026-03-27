# --- Stage 1 : Développement & Build ---
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build -- --configuration production --base-href /hessflix/

EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--configuration", "development"]

# --- Stage 2 : Production (Nginx) ---
FROM nginx:stable-alpine AS production
COPY --from=development /app/dist/*/browser /usr/share/nginx/html/hessflix
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
