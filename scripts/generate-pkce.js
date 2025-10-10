#!/usr/bin/env node

/**
 * @fileoverview PKCE Code Verifier and Challenge Generator
 * @description Generates PKCE code_verifier and code_challenge for testing OAuth2 flows
 *
 * Usage:
 *   node scripts/generate-pkce.js
 *   node scripts/generate-pkce.js --length 128
 *
 * RFC 7636: Proof Key for Code Exchange by OAuth Public Clients
 * https://tools.ietf.org/html/rfc7636
 */

const crypto = require('crypto');

/**
 * Generates a cryptographically secure random string
 *
 * @param {number} length - Length of the verifier (43-128)
 * @returns {string} Base64url encoded random string
 */
function generateCodeVerifier(length = 64) {
  if (length < 43 || length > 128) {
    throw new Error('Code verifier length must be between 43 and 128 characters');
  }

  // Generate random bytes
  const randomBytes = crypto.randomBytes(length);

  // Convert to base64url
  return base64UrlEncode(randomBytes).substring(0, length);
}

/**
 * Generates code challenge from code verifier using S256 method
 *
 * @param {string} codeVerifier - Code verifier string
 * @returns {string} Base64url encoded SHA256 hash
 */
function generateCodeChallenge(codeVerifier) {
  // SHA256 hash
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();

  // Base64url encode
  return base64UrlEncode(hash);
}

/**
 * Converts buffer to base64url encoding
 *
 * @param {Buffer} buffer - Buffer to encode
 * @returns {string} Base64url encoded string
 */
function base64UrlEncode(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Validates code verifier format
 *
 * @param {string} verifier - Code verifier to validate
 * @returns {boolean} True if valid
 */
function validateCodeVerifier(verifier) {
  if (!verifier || verifier.length < 43 || verifier.length > 128) {
    return false;
  }

  // Must contain only [A-Z] [a-z] [0-9] - . _ ~
  const validPattern = /^[A-Za-z0-9\-._~]+$/;
  return validPattern.test(verifier);
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔐 PKCE Code Verifier & Challenge Generator\n');
  console.log('='.repeat(60));

  // Parse command line arguments
  const args = process.argv.slice(2);
  let length = 64; // Default length

  if (args.includes('--length')) {
    const lengthIndex = args.indexOf('--length');
    length = parseInt(args[lengthIndex + 1], 10);

    if (isNaN(length) || length < 43 || length > 128) {
      console.error('❌ Error: Length must be between 43 and 128');
      process.exit(1);
    }
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  try {
    // Generate code verifier
    const codeVerifier = generateCodeVerifier(length);

    // Validate verifier
    if (!validateCodeVerifier(codeVerifier)) {
      throw new Error('Generated code verifier is invalid');
    }

    // Generate code challenge
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Display results
    console.log('\n📋 Generated PKCE Pair:\n');
    console.log(`Code Verifier (${codeVerifier.length} chars):`);
    console.log(`  ${codeVerifier}\n`);
    console.log(`Code Challenge (S256):`);
    console.log(`  ${codeChallenge}\n`);

    console.log('='.repeat(60));
    console.log('\n🔧 Usage in OAuth2 Flow:\n');

    // Step 1: Authorization request
    console.log('1️⃣  Authorization Request (GET /authorize):\n');
    console.log('curl -X GET "http://localhost:4000/authorize?\\');
    console.log('  response_type=code&\\');
    console.log('  client_id=test-client&\\');
    console.log('  redirect_uri=http://localhost:3000/callback&\\');
    console.log(`  code_challenge=${codeChallenge}&\\`);
    console.log('  code_challenge_method=S256&\\');
    console.log('  state=random-state-123"\n');

    // Step 2: Token request
    console.log('2️⃣  Token Request (POST /token):\n');
    console.log('curl -X POST "http://localhost:4000/token" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log("  -d '{\n");
    console.log('    "grant_type": "authorization_code",\n');
    console.log('    "code": "AC_1234567890_abcdef",\n');
    console.log('    "redirect_uri": "http://localhost:3000/callback",\n');
    console.log('    "client_id": "test-client",\n');
    console.log(`    "code_verifier": "${codeVerifier}"\n`);
    console.log("  }'\n");

    console.log('='.repeat(60));
    console.log('\n✅ PKCE pair generated successfully!\n');

    // Export as JSON for programmatic use
    if (args.includes('--json')) {
      const output = {
        code_verifier: codeVerifier,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        length: codeVerifier.length,
        generated_at: new Date().toISOString(),
      };
      console.log('\n📄 JSON Output:\n');
      console.log(JSON.stringify(output, null, 2));
      console.log();
    }

    // Save to file
    if (args.includes('--save')) {
      const fs = require('fs');
      const output = {
        code_verifier: codeVerifier,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        length: codeVerifier.length,
        generated_at: new Date().toISOString(),
      };

      const filename = `pkce-pair-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(output, null, 2));
      console.log(`\n💾 Saved to: ${filename}\n`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Prints help message
 */
function printHelp() {
  console.log('\n📖 PKCE Generator - Help\n');
  console.log('Usage: node scripts/generate-pkce.js [options]\n');
  console.log('Options:');
  console.log('  --length <n>    Length of code verifier (43-128, default: 64)');
  console.log('  --json          Output as JSON');
  console.log('  --save          Save to JSON file');
  console.log('  --help, -h      Show this help message\n');
  console.log('Examples:');
  console.log('  node scripts/generate-pkce.js');
  console.log('  node scripts/generate-pkce.js --length 128');
  console.log('  node scripts/generate-pkce.js --json');
  console.log('  node scripts/generate-pkce.js --length 96 --save\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  generateCodeVerifier,
  generateCodeChallenge,
  validateCodeVerifier,
  base64UrlEncode,
};
