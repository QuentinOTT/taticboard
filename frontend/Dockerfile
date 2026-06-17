# syntax=docker/dockerfile:1

# ─── Stage 1: Dev ───────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ─── Stage 2: Builder ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 3: Runner (Production) ───────────────────────────────
FROM nginx:alpine AS runner
# Copy built static files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx served by the nginx service in docker-compose.prod.yml
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
