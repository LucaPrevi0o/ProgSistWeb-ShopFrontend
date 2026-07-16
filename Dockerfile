# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && \
    mkdir -p /app/dist/shop-frontend/browser/assets && \
    printf '%s\n' 'globalThis.__SHOP_RUNTIME_CONFIG__ = { apiBaseUrl: "/api" };' \
      > /app/dist/shop-frontend/browser/assets/runtime-config.js

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/shop-frontend/browser /usr/share/nginx/html

EXPOSE 80
