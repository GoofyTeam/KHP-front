# -------------------------------
FROM node:22-alpine AS base

ARG VITE_PROJECT_NAME
ARG VITE_API_URL

ENV VITE_PROJECT_NAME=${VITE_PROJECT_NAME:-"KHP PWA"}
ENV VITE_API_URL=${VITE_API_URL:-"http://localhost:3000/api"}

RUN apk update && apk add --no-cache libc6-compat
        
WORKDIR /app
        
RUN npm install -g turbo@^2

# -------------------------------
FROM base AS builder

COPY . .

RUN turbo prune pwa --docker

# -------------------------------
FROM base AS installer

RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
    
# Install dependencies
COPY --from=builder /app/out/json/ ./

RUN npm ci

# Copy source and build
COPY --from=builder /app/out/full/ ./

RUN turbo run build

# Stage 2: Serve with nginx
FROM nginx:alpine

WORKDIR /app

# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=installer /app/apps/pwa/dist /usr/share/nginx/html

# Copy custom nginx config
COPY --from=installer /app/apps/pwa/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]