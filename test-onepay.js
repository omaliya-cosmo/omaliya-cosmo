const crypto = require("crypto");

// Test OnePay hash generation
const testHashGeneration = () => {
  // Using the sample from OnePay docs
  const app_id = "80NR1189D04CD635D8ACD";
  const currency = "LKR";
  const amount = 100.0;
  const hash_salt = "XXXHASHSALTXXX"; // This would be your actual hash salt

  // Generate hash
  const formattedAmount = amount.toFixed(2);
  const concatenatedString = `${app_id}${currency}${formattedAmount}${hash_salt}`;
  console.log("Concatenated string:", concatenatedString);

  const hash = crypto
    .createHash("sha256")
    .update(concatenatedString)
    .digest("hex");
  console.log("Generated hash:", hash);

  // Example from docs: "80NR1189D04CD635D8ACDLKR100.00XXXHASHSALTXXX"
  // Should generate: "126ff89348d80fb91ec4f25c2bd55e2f71d8f3986da9470eabe28b2f8becf21a"
};

// Test with your actual credentials
const testWithActualCredentials = () => {
  const app_id = "3BE91190950F2F3184FFB";
  const currency = "LKR";
  const amount = 1000.0;
  const hash_salt = "WS5S1190950F2F318501E";

  const formattedAmount = amount.toFixed(2);
  const concatenatedString = `${app_id}${currency}${formattedAmount}${hash_salt}`;
  console.log("Your concatenated string:", concatenatedString);

  const hash = crypto
    .createHash("sha256")
    .update(concatenatedString)
    .digest("hex");
  console.log("Your generated hash:", hash);

  return {
    currency,
    app_id,
    hash,
    amount,
    reference: "TEST12345",
    customer_first_name: "John",
    customer_last_name: "Doe",
    customer_phone_number: "+94771234567",
    customer_email: "test@example.com",
    transaction_redirect_url: "https://www.google.com",
    additionalData: "testing",
  };
};

testHashGeneration();
console.log("\n---\n");
const payload = testWithActualCredentials();
console.log("\nTest payload:");
console.log(JSON.stringify(payload, null, 2));
