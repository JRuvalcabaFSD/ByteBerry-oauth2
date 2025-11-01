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

# Copy package and pnpm lock files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm install --frozen-lockfile --prefer-offline

#==============================================================================
# Build Stage - TypeScript compilation with version injection
#==============================================================================
FROM node:lts-slim AS builder

# Accept version as build argument
ARG VERSION
ENV BUILD_VERSION=${VERSION}

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Update package.json version if VERSION arg is provided
COPY scripts/update-version.sh /tmp/update-version.sh
RUN chmod +x /tmp/update-version.sh && /tmp/update-version.sh && rm /tmp/update-version.sh

# Build TypeScript
RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --production

#==============================================================================
# Runtime Stage - Minimal production image
#==============================================================================
FROM node:lts-slim AS runtime

# Accept version for metadata
ARG VERSION
ENV APP_VERSION=${VERSION:-unknown}

# Create non-root user and group
RUN groupadd --system --gid 1001 oauth2 && \
	useradd --system --uid 1001 --gid oauth2 --home /app --shell /bin/false oauth2

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
	dumb-init \
	openssl \
	curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& apt-get clean

WORKDIR /app

# Copy production dependencies
COPY --from=builder --chown=oauth2:oauth2 /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=oauth2:oauth2 /app/dist ./dist
COPY --from=builder --chown=oauth2:oauth2 /app/package.json ./

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/keys && \
	chown -R oauth2:oauth2 /app && \
	chmod -R 755 /app && \
	chmod 700 /app/keys

# Security: Create tmp directory
RUN mkdir -p /tmp && \
	chmod 1777 /tmp

# Switch to non-root user
USER oauth2

# Copy scripts with proper ownership
COPY --from=builder --chown=oauth2:oauth2 /app/scripts/healthCheck.js ./scripts/

# TODO enable it in phase 1
# COPY --from=builder --chown=oauth2:oauth2 /app/scripts/docker-entrypoint.sh ./scripts/


# Make entrypoint executable
# USER root
# RUN chmod +x ./scripts/docker-entrypoint.sh
# USER oauth2

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
	CMD ["node", "scripts/healthCheck.js"]

# Expose port (documentation only - actual port from ENV)
EXPOSE 4000

# TODO enable it in phase 1
# Use dumb-init with custom entrypoint for JWT key management
# ENTRYPOINT ["/usr/bin/dumb-init", "--", "./scripts/docker-entrypoint.sh"]

# Start application
CMD ["node", "dist/app.js"]

# Metadata labels
LABEL maintainer="JRuvalcabaFSD <support@jrmdev.org>"
LABEL description="ByteBerry OAuth2 Service - JWT Auth with Auto Key Management"
LABEL version="${APP_VERSION}"
LABEL org.opencontainers.image.title="ByteBerry OAuth2 Service"
LABEL org.opencontainers.image.description="OAuth2 authentication with Clean Architecture and JWT key auto-management"
LABEL org.opencontainers.image.vendor="JRuvalcabaFSD"
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2"
LABEL org.opencontainers.image.documentation="https://github.com/JRuvalcabaFSD/ByteBerry-OAuth2#readme"

#==============================================================================
# Usage Notes:
#
# Development (auto-generate keys):
#   docker run -e NODE_ENV=development -p 4000:4000 byteberry-oauth2:latest
#
# Production (mount keys):
#   docker run -e NODE_ENV=production \
#              -v /path/to/keys:/app/keys:ro \
#              -p 4000:4000 \
#              byteberry-oauth2:latest
#
# OpenMediaVault (with Portainer):
#   See: OMV_JWT_KEYS_SETUP.md
#==============================================================================
