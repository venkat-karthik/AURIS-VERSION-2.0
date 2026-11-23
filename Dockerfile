# =======================================================
# AURIS 2.0 ENTERPRISE TELEPHONY PLATFORM DOCKERFILE
# =======================================================

FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install all dependencies including devDependencies for build
RUN bun install --frozen-lockfile || bun install

# Copy source code and assets
COPY . .

# Run production build
RUN bun run build

# =======================================================
# PRODUCTION RUNTIME
# =======================================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and package manifest
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

# Ensure data recordings directory exists
RUN mkdir -p data/recordings

EXPOSE 3000

# Start production server
CMD ["bun", "dist/server.cjs"]

