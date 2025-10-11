#!/bin/bash

# Setup production JWT keys on Raspberry Pi
# ByteBerry OAuth2 Service - Production Environment

set -e

KEYS_DIR="/opt/byteberry/keys"
PRIVATE_KEY="${KEYS_DIR}/jwt-private.pem"
PUBLIC_KEY="${KEYS_DIR}/jwt-public.pem"
BACKUP_DIR="/opt/byteberry/keys-backup"

echo "🔐 Setting up production JWT keys..."

# Ensure running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root or with sudo"
  exit 1
fi

# Create secure directories
mkdir -p "${KEYS_DIR}"
mkdir -p "${BACKUP_DIR}"

# Set restrictive permissions on directories
chmod 700 "${KEYS_DIR}"
chmod 700 "${BACKUP_DIR}"

# Check if keys already exist
if [ -f "${PRIVATE_KEY}" ] && [ -f "${PUBLIC_KEY}" ]; then
  echo "⚠️  Production keys already exist!"
  echo "    Private: ${PRIVATE_KEY}"
  echo "    Public:  ${PUBLIC_KEY}"
  
  read -p "⚠️  Regenerate? This will invalidate ALL existing tokens! (yes/NO): " -r
  if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "✅ Keeping existing keys"
    exit 0
  fi
  
  # Backup existing keys
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  echo "📦 Backing up existing keys..."
  cp "${PRIVATE_KEY}" "${BACKUP_DIR}/jwt-private-${TIMESTAMP}.pem"
  cp "${PUBLIC_KEY}" "${BACKUP_DIR}/jwt-public-${TIMESTAMP}.pem"
  echo "✅ Backup saved to ${BACKUP_DIR}/"
fi

# Generate new RSA-2048 key pair
echo "🔑 Generating production RSA-2048 key pair..."
openssl genrsa -out "${PRIVATE_KEY}" 2048 2>/dev/null
openssl rsa -in "${PRIVATE_KEY}" -pubout -out "${PUBLIC_KEY}" 2>/dev/null

# Set strict permissions
chmod 400 "${PRIVATE_KEY}"  # Read-only for owner
chmod 444 "${PUBLIC_KEY}"   # Read-only for everyone

echo "✅ Production keys generated:"
echo "   - Private: ${PRIVATE_KEY} (400)"
echo "   - Public:  ${PUBLIC_KEY} (444)"

# Generate key ID
KEY_ID="prod-$(date +%Y%m%d-%H%M%S)"

# Create environment file for Docker
ENV_FILE="/opt/byteberry/oauth2.env"
cat > "${ENV_FILE}" << EOF
# ByteBerry OAuth2 - Production Environment
# Generated: $(date)
NODE_ENV=production
PORT=4000
LOG_LEVEL=info

# JWT Configuration
JWT_PRIVATE_KEY_FILE=${PRIVATE_KEY}
JWT_PUBLIC_KEY_FILE=${PUBLIC_KEY}
JWT_ISSUER=byteberry-oauth2
JWT_AUDIENCE=byteberry-api
JWT_EXPIRES_IN=900
JWT_KEY_ID=${KEY_ID}

# Security
CORS_ORIGINS=https://byteberry.app.jrmdev.org,https://byteberry.api.jrmdev.org
EOF

chmod 600 "${ENV_FILE}"

echo "✅ Environment file created: ${ENV_FILE}"
echo ""
echo "📋 Next steps:"
echo "   1. Update docker-compose.yml to mount keys:"
echo "      volumes:"
echo "        - ${KEYS_DIR}:/app/keys:ro"
echo "   2. Restart OAuth2 service"
echo "   3. Verify JWKS endpoint: curl https://byteberry.auth.jrmdev.org/.well-known/jwks.json"
echo ""
echo "🔐 Security checklist:"
echo "   ✅ Keys generated on production server"
echo "   ✅ Private key permissions: 400"
echo "   ✅ Keys backed up to ${BACKUP_DIR}"
echo "   ✅ Environment file secured: 600"