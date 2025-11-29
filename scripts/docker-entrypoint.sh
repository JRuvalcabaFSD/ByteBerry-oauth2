#!/bin/sh
set -e

echo "🚀 ByteBerry OAuth2 Service Starting..."
echo "📦 Version: ${APP_VERSION:-unknown}"
echo "🌍 Environment: ${NODE_ENV:-development}"

# ============================================
# STEP 1: Wait for PostgreSQL to be ready
# ============================================
echo "⏳ Waiting for PostgreSQL..."

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "ignore" ]; then
  MAX_RETRIES=30
  RETRY_COUNT=0

  until node -e "
    const { PrismaClient } = require('./node_modules/@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$connect()
      .then(() => { console.log('✅ PostgreSQL ready'); prisma.\$disconnect(); process.exit(0); })
      .catch(() => process.exit(1));
  " 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
  done

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ PostgreSQL connection timeout after $MAX_RETRIES attempts"
    exit 1
  fi

  echo "✅ PostgreSQL is ready"
else
  echo "⏭️  Skipping PostgreSQL wait (DATABASE_URL not set or is 'ignore')"
fi

# ============================================
# STEP 2: Run Database Migrations (Production only)
# ============================================
if [ "$NODE_ENV" = "production" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "ignore" ]; then
    echo "🔄 Running database migrations..."

    npx prisma migrate deploy

    if [ $? -eq 0 ]; then
      echo "✅ Migrations completed successfully"
    else
      echo "❌ Migration failed"
      exit 1
    fi
  else
    echo "⚠️  Cannot run migrations: DATABASE_URL not set"
  fi
else
  echo "⏭️  Skipping migrations (NODE_ENV=$NODE_ENV, RUN_MIGRATIONS=$RUN_MIGRATIONS)"
fi

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
