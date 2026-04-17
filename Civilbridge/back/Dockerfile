# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — install production dependencies only
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files and install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema so the client generator can run
COPY prisma ./prisma
RUN npx prisma generate

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: runner — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

ENV NODE_ENV=production

# Copy installed modules and generated Prisma client from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma       ./prisma

# Copy application source
COPY src ./src

# Create writable directories
RUN mkdir -p logs uploads && chown -R app:app /app

USER app

EXPOSE 3000

# Healthcheck — Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
