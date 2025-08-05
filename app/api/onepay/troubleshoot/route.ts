import { NextResponse } from "next/server";
import crypto from "crypto";

// This endpoint helps troubleshoot OnePay authentication by testing different approaches
export async function GET() {
  try {
    // Get OnePay credentials from environment
    const APP_ID = process.env.ONEPAY_APP_ID;
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
    const HASH_SALT = process.env.ONEPAY_HASH_SALT;
    const API_URL = "https://api.onepay.lk/v3/checkout/link/";

    // Create a test order with consistent reference
    const testOrderId = "TEST" + Date.now().toString();
    const testAmount = 1000; // 1000 LKR
    const testCurrency = "LKR";
    const testReference = "TEST-ORDER-REF-123"; // Exactly 17 characters

    // Generate hash for the test order
    const hashInput = `${APP_ID}${testCurrency}${testAmount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Create a basic payload
    const basePayload = {
      currency: testCurrency,
      app_id: APP_ID,
      hash: hash,
      amount: testAmount,
      reference: testReference,
      customer_first_name: "Test",
      customer_last_name: "User",
      customer_phone_number: "0771234567",
      customer_email: "test@example.com",
      transaction_redirect_url: "http://localhost:3000/test-callback",
      additional_data: testOrderId,
    };

    // Test different authentication methods
    const tests = [];

    // We'll try 5 different approaches:

    // Test 1: No authorization header
    try {
      const noAuthResponse = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });

      tests.push({
        name: "No Authorization header",
        status: noAuthResponse.status,
        response: await noAuthResponse.text(),
      });
    } catch (error) {
      tests.push({
        name: "No Authorization header",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 2: Plain token as Authorization header
    if (APP_TOKEN) {
      try {
        const plainTokenResponse = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: APP_TOKEN,
          },
          body: JSON.stringify(basePayload),
        });

        tests.push({
          name: "Plain Token",
          status: plainTokenResponse.status,
          response: await plainTokenResponse.text(),
        });
      } catch (error) {
        tests.push({
          name: "Plain Token",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Test 3: Bearer token
    if (APP_TOKEN) {
      try {
        const bearerResponse = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${APP_TOKEN}`,
          },
          body: JSON.stringify(basePayload),
        });

        tests.push({
          name: "Bearer Token",
          status: bearerResponse.status,
          response: await bearerResponse.text(),
        });
      } catch (error) {
        tests.push({
          name: "Bearer Token",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Test 4: Token and App-ID in header
    if (APP_TOKEN && APP_ID) {
      try {
        const combinedResponse = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: APP_TOKEN,
            "App-ID": APP_ID,
          },
          body: JSON.stringify(basePayload),
        });

        tests.push({
          name: "Token + App-ID Headers",
          status: combinedResponse.status,
          response: await combinedResponse.text(),
        });
      } catch (error) {
        tests.push({
          name: "Token + App-ID Headers",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Test 5: Different hash calculation approach
    if (APP_TOKEN) {
      try {
        // Try with amount as string instead of number
        const altHashInput = `${APP_ID}${testCurrency}${testAmount.toString()}${HASH_SALT}`;
        const altHash = crypto
          .createHash("sha256")
          .update(altHashInput)
          .digest("hex");

        const altPayload = {
          ...basePayload,
          hash: altHash,
        };

        const altHashResponse = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: APP_TOKEN,
          },
          body: JSON.stringify(altPayload),
        });

        tests.push({
          name: "Alternative Hash (amount as string)",
          status: altHashResponse.status,
          response: await altHashResponse.text(),
        });
      } catch (error) {
        tests.push({
          name: "Alternative Hash",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Return the test results for analysis
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests,
      credentials_info: {
        app_id_length: APP_ID?.length || 0,
        token_length: APP_TOKEN?.length || 0,
        hash_salt_length: HASH_SALT?.length || 0,
      },
      test_payload: {
        ...basePayload,
        app_id: basePayload.app_id
          ? basePayload.app_id.substring(0, 5) + "..."
          : null,
        hash: basePayload.hash
          ? basePayload.hash.substring(0, 10) + "..."
          : null,
      },
    });
  } catch (error) {
    console.error("OnePay troubleshooting error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
