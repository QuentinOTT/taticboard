# syntax=docker/dockerfile:1

# ─── Stage 1: Dev ───────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ─── Stage 2: Builder ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 3: Runner (Production) ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
# Copy compiled JS
COPY --from=builder /app/dist ./dist
# Copy SQL migration and seed files (since tsc ignores .sql files)
COPY --from=builder /app/src/db/migrations ./dist/db/migrations
COPY --from=builder /app/src/db/seeds ./dist/db/seeds
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
