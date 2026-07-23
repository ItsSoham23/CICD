# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for any build steps if needed)
RUN npm ci

# Copy source code (we don't need tests in final build but we copy everything for building/linting)
COPY src/ ./src/

# Install only production dependencies for the final stage
RUN npm prune --production

# Stage 2: Final runtime stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Set Node environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and built files
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/src ./src

# Expose port
EXPOSE 3000

# Health check setup hitting the /health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
