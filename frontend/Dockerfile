# ── Stage 1: Build con Vite ───────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Argumentos de build-time inyectados por el workflow de GitHub Actions
ARG VITE_API_VENTAS_URL
ARG VITE_API_DESPACHOS_URL

# Exportar como variables de entorno para que Vite las incluya en el bundle
ENV VITE_API_VENTAS_URL=$VITE_API_VENTAS_URL
ENV VITE_API_DESPACHOS_URL=$VITE_API_DESPACHOS_URL

# Instalar dependencias (cache layer)
COPY package*.json ./
RUN npm install

# Copiar fuentes y construir
COPY . .
RUN npm run build

# ── Stage 2: Servir con nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
