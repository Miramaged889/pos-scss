# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps (includes "serve")
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/dist ./dist

# Expose default port
EXPOSE 8080

# Start static server on provided PORT
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
