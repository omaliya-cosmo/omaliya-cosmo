import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Get OnePay credentials from environment
    const APP_ID = process.env.ONEPAY_APP_ID;
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
    const HASH_SALT = process.env.ONEPAY_HASH_SALT;
    const API_URL = "https://api.onepay.lk/v3/checkout/link/";

    // Create a test payment with minimal data
    const testAmount = 1000; // 1000 LKR
    const testCurrency = "LKR";

    // Generate hash according to OnePay docs
    const hashInput = `${APP_ID}${testCurrency}${testAmount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    const payload = {
      currency: testCurrency,
      app_id: APP_ID,
      hash: hash,
      amount: testAmount,
      reference: "TEST-REF-" + Date.now().toString().substring(5), // At least 10 characters
      customer_first_name: "Test",
      customer_last_name: "User",
      customer_phone_number: "0000000000",
      customer_email: "test@example.com",
      transaction_redirect_url: "http://localhost:3000/test-callback",
      additional_data: "test-order-" + Date.now(),
    };

    // Try different authorization approaches
    const results = [];

    // Test 1: With Bearer token
    const bearerResponse = await testRequest(
      API_URL,
      payload,
      `Bearer ${APP_TOKEN}`
    );
    results.push({
      method: "Bearer Token",
      status: bearerResponse.status,
      response: await bearerResponse.text(),
    });

    // Test 2: With just the token
    const tokenResponse = await testRequest(API_URL, payload, APP_TOKEN);
    results.push({
      method: "Plain Token",
      status: tokenResponse.status,
      response: await tokenResponse.text(),
    });

    // Test 3: Without authorization header
    const noAuthResponse = await testRequest(API_URL, payload);
    results.push({
      method: "No Authorization",
      status: noAuthResponse.status,
      response: await noAuthResponse.text(),
    });

    return NextResponse.json({
      success: true,
      tests: results,
      env: {
        app_id_present: !!APP_ID,
        app_id_length: APP_ID?.length || 0,
        token_present: !!APP_TOKEN,
        token_length: APP_TOKEN?.length || 0,
        hash_salt_present: !!HASH_SALT,
        hash_salt_length: HASH_SALT?.length || 0,
      },
      hash: {
        input: hashInput.replace(/./g, (c, i) =>
          i < 5 || i > hashInput.length - 5 ? c : "*"
        ),
        output: hash,
      },
    });
  } catch (error) {
    console.error("OnePay test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function testRequest(
  url: string,
  payload: any,
  authHeader?: string | null
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}
