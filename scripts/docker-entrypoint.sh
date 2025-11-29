#!/bin/sh
set -e

echo "🚀 ByteBerry OAuth2 Service Starting..."
echo "📦 Version: ${APP_VERSION:-unknown}"
echo "🌍 Environment: ${NODE_ENV:-development}"

# ============================================
# STEP 3: JWT Key Management
# ============================================
echo "🔐 ByteBerry OAuth2 - JWT Key Management"

if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Production mode detected"

  # Verificar que las claves existan
  if [ ! -f "/app/keys/private.pem" ] || [ ! -f "/app/keys/public.pem" ]; then
    echo "❌ ERROR: JWT keys not found in /app/keys/"
    echo "Please mount keys volume: -v /path/to/keys:/app/keys:ro"
    exit 1
  fi

  # Verificar permisos
  if [ "$(stat -c '%a' /app/keys/private.pem 2>/dev/null || stat -f '%Lp' /app/keys/private.pem 2>/dev/null)" != "600" ]; then
    echo "⚠️  WARNING: private.pem should have 600 permissions"
  fi

  echo "✅ JWT keys validated successfully"

  # Cargar claves desde archivos a variables de entorno (si no están definidas)
  if [ -z "$JWT_PRIVATE_KEY" ]; then
    export JWT_PRIVATE_KEY=$(cat /app/keys/private.pem | tr '\n' '|' | sed 's/|/\\n/g')
  fi

  if [ -z "$JWT_PUBLIC_KEY" ]; then
    export JWT_PUBLIC_KEY=$(cat /app/keys/public.pem | tr '\n' '|' | sed 's/|/\\n/g')
  fi

else
  echo "🛠️  Development mode detected"

  # Auto-generar claves si no existen
  if [ ! -f "/app/keys/private.pem" ]; then
    echo "🔧 Generating JWT keys automatically..."
    node scripts/generate-keys.js
    echo "✅ Keys generated in /app/keys/"
  else
    echo "✅ Using existing keys from /app/keys/"
  fi

  # Cargar desde archivos
  export JWT_PRIVATE_KEY=$(cat /app/keys/private.pem | tr '\n' '|' | sed 's/|/\\n/g')
  export JWT_PUBLIC_KEY=$(cat /app/keys/public.pem | tr '\n' '|' | sed 's/|/\\n/g')
fi

# ============================================
# STEP 4: Start Application
# ============================================
echo "🎉 Starting OAuth2 Service..."
echo "   Port: ${PORT:-4000}"
echo "   Key ID: ${JWT_KEY_ID:-default-key-1}"

# Ejecutar la aplicación
exec "$@"
