# -------------------------------
FROM node:22-alpine AS base

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:8000"}

RUN apk update && apk add --no-cache libc6-compat
    
WORKDIR /app
    
RUN npm install -g turbo@^2
    
# -------------------------------
FROM base AS builder
    
# Copiez tout le repo dans /app
COPY . .
    
# Générez un prune pour le workspace "web"
RUN turbo prune web --docker
    
# -------------------------------
FROM base AS installer
    
# Répétez la même installation système (sécurité)
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
    
# Récupérez le lockfile et package.json du prune
COPY --from=builder /app/out/json/ ./
    
# Installez les dépendances avec npm (ci respecte package-lock.json)
RUN npm ci
    
# Récupérez le reste du workspace
COPY --from=builder /app/out/full/ ./
    
# Lancez la compilation
RUN turbo run build
    
# -------------------------------
# Étape finale : runner
# -------------------------------
FROM base AS runner
    
WORKDIR /app
    
# Créez un user non-root
RUN addgroup -S --gid 1001 nodejs \
    && adduser  -S --uid 1001 nextjs
    
USER nextjs
    
# Copiez les outputs Next.js standalone + static + public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static   ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public         ./apps/web/public
    
# Commande de lancement
CMD ["node", "apps/web/server.js"]
    