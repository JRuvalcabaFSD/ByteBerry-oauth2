#!/bin/bash
# verify-oauth2.sh

echo "🔍 Verificando OAuth2 Service..."
echo ""

BASE_URL="http://localhost:4000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar respuesta
check_status() {
  if [ $1 -eq $2 ]; then
    echo -e "${GREEN}✓ PASS${NC} - $3"
  else
    echo -e "${RED}✗ FAIL${NC} - $3 (Expected: $2, Got: $1)"
  fi
}

# Test 1: Health Check
echo -e "${YELLOW}[1/10]${NC} Testing Health Check..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json $BASE_URL/health)
check_status $RESPONSE 200 "Health endpoint"
echo ""

# Test 2: JWKS Endpoint
echo -e "${YELLOW}[2/10]${NC} Testing JWKS Endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json $BASE_URL/.well-known/jwks.json)
check_status $RESPONSE 200 "JWKS endpoint"
echo ""

# Generar PKCE
echo -e "${YELLOW}[3/10]${NC} Generating PKCE..."
CODE_VERIFIER=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
CODE_CHALLENGE=$(node -e "console.log(require('crypto').createHash('sha256').update('$CODE_VERIFIER').digest('base64url'))")
echo "Code Verifier: $CODE_VERIFIER"
echo "Code Challenge: $CODE_CHALLENGE"
echo ""

# Test 3: Authorize Endpoint (Happy Path)
echo -e "${YELLOW}[4/10]${NC} Testing Authorize Endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$BASE_URL/authorize?client_id=test_client_12345678&response_type=code&redirect_uri=http://localhost:3000/callback&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256&state=test_state")
check_status $RESPONSE 302 "Authorize endpoint redirect"

# Extraer código de la Location header
LOCATION=$(curl -s -D - "$BASE_URL/authorize?client_id=test_client_12345678&response_type=code&redirect_uri=http://localhost:3000/callback&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256&state=test_state" | grep -i "^Location:" | cut -d' ' -f2)
AUTH_CODE=$(echo $LOCATION | sed 's/.*code=\([^&]*\).*/\1/' | tr -d '\r\n')
echo "Generated Code: $AUTH_CODE"
echo ""

# Test 4: Token Endpoint (Happy Path)
echo -e "${YELLOW}[5/10]${NC} Testing Token Endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST $BASE_URL/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$AUTH_CODE&redirect_uri=http://localhost:3000/callback&client_id=test_client_12345678&code_verifier=$CODE_VERIFIER")
check_status $RESPONSE 200 "Token exchange"
cat /tmp/response.json | jq '.'
echo ""

# Test 5: Reuse Code (Should Fail)
echo -e "${YELLOW}[6/10]${NC} Testing Code Reuse (Should Fail)..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST $BASE_URL/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$AUTH_CODE&redirect_uri=http://localhost:3000/callback&client_id=test_client_12345678&code_verifier=$CODE_VERIFIER")
check_status $RESPONSE 400 "Code reuse prevention"
cat /tmp/response.json | jq '.'
echo ""

# Test 6: Invalid Client ID
echo -e "${YELLOW}[7/10]${NC} Testing Invalid Client ID..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL/authorize?client_id=short&response_type=code&redirect_uri=http://localhost:3000/callback&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256")
check_status $RESPONSE 400 "Invalid client_id rejection"
cat /tmp/response.json | jq '.'
echo ""

# Test 7: Missing PKCE
echo -e "${YELLOW}[8/10]${NC} Testing Missing PKCE..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL/authorize?client_id=test_client_12345678&response_type=code&redirect_uri=http://localhost:3000/callback")
check_status $RESPONSE 400 "Missing PKCE rejection"
cat /tmp/response.json | jq '.'
echo ""

# Test 8: Wrong Code Verifier
echo -e "${YELLOW}[9/10]${NC} Testing Wrong Code Verifier..."
# Generate new auth code
LOCATION=$(curl -s -D - "$BASE_URL/authorize?client_id=test_client_12345678&response_type=code&redirect_uri=http://localhost:3000/callback&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256&state=test_state" | grep -i "^Location:" | cut -d' ' -f2)
NEW_CODE=$(echo $LOCATION | sed 's/.*code=\([^&]*\).*/\1/' | tr -d '\r\n')
WRONG_VERIFIER=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST $BASE_URL/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$NEW_CODE&redirect_uri=http://localhost:3000/callback&client_id=test_client_12345678&code_verifier=$WRONG_VERIFIER")
check_status $RESPONSE 400 "Wrong code_verifier rejection"
cat /tmp/response.json | jq '.'
echo ""

# Test 9: Unsupported Grant Type
echo -e "${YELLOW}[10/10]${NC} Testing Unsupported Grant Type..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST $BASE_URL/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=test&password=test")
check_status $RESPONSE 400 "Unsupported grant_type rejection"
cat /tmp/response.json | jq '.'
echo ""

echo "✅ Verification Complete!"
