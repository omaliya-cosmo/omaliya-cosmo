// Test OnePay credentials without dotenv
const fs = require("fs");
const path = require("path");

// Read .env file manually
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").replace(/"/g, "").trim();
  }
});

const testCredentials = () => {
  console.log("Environment Variables Check:");
  console.log("ONEPAY_APP_ID:", envVars.ONEPAY_APP_ID ? "✓ Set" : "✗ Missing");
  console.log(
    "ONEPAY_HASH_SALT:",
    envVars.ONEPAY_HASH_SALT ? "✓ Set" : "✗ Missing"
  );
  console.log(
    "ONEPAY_API_TOKEN:",
    envVars.ONEPAY_API_TOKEN ? "✓ Set" : "✗ Missing"
  );

  console.log("\nCredential Lengths:");
  console.log("APP_ID length:", envVars.ONEPAY_APP_ID?.length || 0);
  console.log("HASH_SALT length:", envVars.ONEPAY_HASH_SALT?.length || 0);
  console.log("API_TOKEN length:", envVars.ONEPAY_API_TOKEN?.length || 0);

  console.log("\nFirst/Last 5 characters (for verification):");
  const appId = envVars.ONEPAY_APP_ID || "";
  const hashSalt = envVars.ONEPAY_HASH_SALT || "";
  const apiToken = envVars.ONEPAY_API_TOKEN || "";

  console.log("APP_ID:", `${appId.slice(0, 5)}...${appId.slice(-5)}`);
  console.log("HASH_SALT:", `${hashSalt.slice(0, 5)}...${hashSalt.slice(-5)}`);
  console.log("API_TOKEN:", `${apiToken.slice(0, 5)}...${apiToken.slice(-5)}`);
};

testCredentials();
