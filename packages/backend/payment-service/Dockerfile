FROM node:18-alpine

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm ci

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy source code
COPY --chown=appuser:appgroup . .

# Expose port
EXPOSE 3003

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3003/api/v1/health || exit 1

# Switch to non-root user
USER appuser

# Start the service
CMD ["npm", "start"]