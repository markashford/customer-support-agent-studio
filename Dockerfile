# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Build the Next.js application
ENV NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR=true
ENV NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR=true
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

# Expose the application port
EXPOSE 3000

# Set environment variables for runtime
ENV NODE_ENV=production
ENV NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR=true
ENV NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["npm", "start"]
