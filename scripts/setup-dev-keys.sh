#!/bin/bash

# Setup development JWT keys
# ByteBerry OAuth2 Service - Development Environment

set -e

KEYS_DIR="keys"
PRIVATE_KEY="${KEYS_DIR}/private.pem"
PUBLIC_KEY="${KEYS_DIR}/public.pem"
ENV_FILE=".env"

echo "🔐 Setting up development JWT keys..."

# Create keys directory
mkdir -p "${KEYS_DIR}"

# Check if keys already exist
if [ -f "${PRIVATE_KEY}" ] && [ -f "${PUBLIC_KEY}" ]; then
  echo "⚠️  Keys already exist in ${KEYS_DIR}/"
  read -p "Regenerate keys? This will invalidate existing tokens (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Using existing keys"
    exit 0
  fi
  echo "🔄 Regenerating keys..."
fi

# Generate new RSA key pair
echo "🔑 Generating RSA-2048 key pair..."
openssl genrsa -out "${PRIVATE_KEY}" 2048 2>/dev/null
openssl rsa -in "${PRIVATE_KEY}" -pubout -out "${PUBLIC_KEY}" 2>/dev/null

echo "✅ Keys generated successfully:"
echo "   - Private: ${PRIVATE_KEY}"
echo "   - Public:  ${PUBLIC_KEY}"

# Format keys for .env (escape newlines)
PRIVATE_KEY_ESCAPED=$(awk '{printf "%s\\n", $0}' "${PRIVATE_KEY}")
PUBLIC_KEY_ESCAPED=$(awk '{printf "%s\\n", $0}' "${PUBLIC_KEY}")

# Update or create .env file
if [ -f "${ENV_FILE}" ]; then
  echo "📝 Updating ${ENV_FILE}..."
  
  # Remove old JWT key entries
  sed -i.bak '/^JWT_PRIVATE_KEY=/d' "${ENV_FILE}"
  sed -i.bak '/^JWT_PUBLIC_KEY=/d' "${ENV_FILE}"
  rm -f "${ENV_FILE}.bak"
  
  # Add new keys
  echo "" >> "${ENV_FILE}"
  echo "# JWT Keys (Generated: $(date))" >> "${ENV_FILE}"
  echo "JWT_PRIVATE_KEY=\"${PRIVATE_KEY_ESCAPED}\"" >> "${ENV_FILE}"
  echo "JWT_PUBLIC_KEY=\"${PUBLIC_KEY_ESCAPED}\"" >> "${ENV_FILE}"
else
  echo "📝 Creating ${ENV_FILE}..."
  cat > "${ENV_FILE}" << EOF
# ByteBerry OAuth2 - Development Environment
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug

# JWT Configuration (Generated: $(date))
JWT_PRIVATE_KEY="${PRIVATE_KEY_ESCAPED}"
JWT_PUBLIC_KEY="${PUBLIC_KEY_ESCAPED}"
JWT_ISSUER=byteberry-oauth2
JWT_AUDIENCE=byteberry-api
JWT_EXPIRES_IN=900
JWT_KEY_ID=dev-$(date +%s)
EOF
fi

echo "✅ .env file updated with keys"
echo ""
echo "⚠️  SECURITY REMINDERS:"
echo "   - Never commit .env to Git"
echo "   - Never share private.pem"
echo "   - Keys are in .gitignore"
echo ""
echo "🚀 Ready for development!"