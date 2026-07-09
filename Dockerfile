# ░░ Étape 1 — build du site avec Vite ░░
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ░░ Étape 2 — service statique via nginx ░░
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Injecte le domaine (SITE_URL) dans les balises Open Graph au démarrage du conteneur.
COPY docker-site-url.sh /docker-entrypoint.d/40-site-url.sh
RUN chmod +x /docker-entrypoint.d/40-site-url.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
