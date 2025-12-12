const crypto = require("crypto");

// Generar code_verifier (43-128 caracteres base64url)
const codeVerifier = crypto.randomBytes(32).toString("base64url");

// Generar code_challenge (SHA256 del verifier)
const codeChallenge = crypto
	.createHash("sha256")
	.update(codeVerifier)
	.digest("base64url");

console.log("Code Verifier:", codeVerifier);
console.log("Code Challenge:", codeChallenge);
console.log("\nGuarda el Code Verifier para usarlo en el paso 4.3");
