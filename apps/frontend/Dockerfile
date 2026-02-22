# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/frontend ./apps/frontend/

# Set production env for build
ENV NODE_ENV=production
# These can be overridden at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build (Turbo)
RUN npx turbo run build --filter=frontend

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built public folder and standalone server
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
