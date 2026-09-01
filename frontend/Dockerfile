# Estágio 1: Build da Aplicação
FROM node:22-alpine AS builder

WORKDIR /app

ENV VITE_API_URL=/api

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio 2: Servidor Web Estático
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
