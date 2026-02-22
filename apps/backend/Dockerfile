# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/backend ./apps/backend/

# Generate Prisma Client & Build
RUN npx turbo run build --filter=backend

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built files and node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/apps/backend/prisma ./prisma/

# Expose port
EXPOSE 3001

# Run the app
CMD ["npm", "run", "deploy"]
