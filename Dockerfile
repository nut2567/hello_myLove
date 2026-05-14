# syntax=docker.io/docker/dockerfile:1

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# ============================================
# Stage 2: Build the application
# ============================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ============================================
# Stage 3: Production runtime
# ============================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=Asia/Bangkok

# Install curl for healthchecks and create non-root user
RUN apt-get update && apt-get install -y curl --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3600

# Set the port environment variable
ENV PORT=3600
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["bun", "server.js"]
