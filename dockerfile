# syntax=docker/dockerfile:1.4
# Multi-stage Dockerfile for ByteBerry OAuth2 Service
# Optimized for Raspberry Pi 5 (ARM64) and AMD64

#==============================================================================
# Dependencies Stage - Install deps without source code
#==============================================================================
FROM node:lts-slim AS deps

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
	python3 \
	make \
	g++ \
	&& rm -rf /var/lib/apt/lists/*

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
RUN pnpm --version

# Set working directory
WORKDIR /app

# Copy only lock file and install deps
COPY pnpm-lock.yaml ./

# Create minimal package.json for dependency installation
RUN echo '{"name":"temp","version":"1.0.0"}' > package.json

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm install --frozen-lockfile --prefer-offline

#==============================================================================
# Build Stage - TypeScript compilation with updated package.json
#==============================================================================
FROM node:lts-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Build TypeScript
RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --production

#==============================================================================
# Runtime Stage - Minimal production image
#==============================================================================
FROM node:lts-slim AS runtime

# Create non-root user and group
RUN groupadd --system --gid 1001 oauth2 && \
	useradd --system --uid 1001 --gid oauth2 --home /app --shell /bin/false oauth2

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
	dumb-init \
	&& rm -rf /var/lib/apt/lists/* \
	&& apt-get clean

# Copy production dependencies
COPY --from=builder --chown=oauth2:oauth2 /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=oauth2:oauth2 /app/dist ./dist
COPY --from=builder --chown=oauth2:oauth2 /app/package.json ./

# Create necessary directories and set permissions
RUN mkdir -p /app/logs && \
	chown -R oauth2:oauth2 /app && \
	chmod -R 755 /app

# Security: Remove unnecessary packages and create tmp directory
RUN mkdir -p /tmp && \
	chmod 1777 /tmp

# Switch to non-root user
USER oauth2

# Copy health check script
COPY --from=builder --chown=oauth2:oauth2 /app/scripts/healthCheck.js ./scripts/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD ["node", "scripts/healthCheck.js"]

# Expose port (documentation only - actual port from ENV)
EXPOSE 4000

# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "dist/app.js"]

# Metadata labels
LABEL maintainer="JRuvalcabaFSD <support@jrmdev.org>"
LABEL description="ByteBerry OAuth2 Service - Microservice for OAuth2 authentication"
LABEL version="0.1.0"
LABEL org.opencontainers.image.title="ByteBerry OAuth2 Service"
LABEL org.opencontainers.image.description="OAuth2 authentication microservice with Clean Architecture"
LABEL org.opencontainers.image.vendor="JRuvalcabaFSD"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2"
LABEL org.opencontainers.image.documentation="https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2#readme"
