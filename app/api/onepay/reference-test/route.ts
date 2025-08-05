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

    // Base payload
    const basePayload = {
      currency: testCurrency,
      app_id: APP_ID,
      hash: hash,
      amount: testAmount,
      customer_first_name: "Test",
      customer_last_name: "User",
      customer_phone_number: "0000000000",
      customer_email: "test@example.com",
      transaction_redirect_url: "http://localhost:3000/test-callback",
      additional_data: "test-order-" + Date.now(),
    };

    // Test different reference lengths
    const results = [];

    // Test 1: Reference with exactly 10 characters
    const ref10Response = await testWithReference(
      API_URL,
      { ...basePayload, reference: "REF1234567" },
      `Bearer ${APP_TOKEN}`
    );
    results.push({
      reference: "REF1234567",
      length: "REF1234567".length,
      status: ref10Response.status,
      response: await ref10Response.text(),
    });

    // Test 2: Reference with 15 characters
    const ref15Response = await testWithReference(
      API_URL,
      { ...basePayload, reference: "REFERENCE12345" },
      `Bearer ${APP_TOKEN}`
    );
    results.push({
      reference: "REFERENCE12345",
      length: "REFERENCE12345".length,
      status: ref15Response.status,
      response: await ref15Response.text(),
    });

    // Test 3: Reference with 21 characters (maximum allowed by OnePay)
    const ref21Response = await testWithReference(
      API_URL,
      { ...basePayload, reference: "REFERENCE1234567890123" },
      `Bearer ${APP_TOKEN}`
    );
    results.push({
      reference: "REFERENCE1234567890123",
      length: "REFERENCE1234567890123".length,
      status: ref21Response.status,
      response: await ref21Response.text(),
    });

    return NextResponse.json({
      success: true,
      reference_tests: results,
      env: {
        app_id_present: !!APP_ID,
        app_id_length: APP_ID?.length || 0,
        token_present: !!APP_TOKEN,
        token_length: APP_TOKEN?.length || 0,
      },
      hash_info: {
        hash_method: "sha256",
        hash_length: hash.length,
      },
    });
  } catch (error) {
    console.error("OnePay reference test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function testWithReference(
  url: string,
  payload: any,
  authHeader: string
) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });
}
