import { NextResponse } from "next/server";
import {
  calculateOnePayHash,
  formatOnePayReference,
  getOnePayAuthHeaders,
  maskSensitiveData,
  API_URL,
} from "../onepay-helpers";

export async function GET() {
  try {
    // Get OnePay credentials from environment
    const APP_ID = process.env.ONEPAY_APP_ID?.trim();
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN?.trim();
    const HASH_SALT = process.env.ONEPAY_HASH_SALT?.trim();
    const CALLBACK_TOKEN = process.env.ONEPAY_CALLBACK_TOKEN?.trim();

    // Test data
    const testAmount = 1000;
    const testCurrency = "LKR";
    const testOrderId = "TEST123456789";
    const testReference = formatOnePayReference(testOrderId);

    // Calculate hash for testing
    const hash = calculateOnePayHash(testCurrency, testAmount);

    // Get auth headers
    const headers = getOnePayAuthHeaders();

    // Test payload
    const testPayload = {
      app_id: APP_ID,
      hash: hash,
      currency: testCurrency,
      amount: testAmount,
      reference: testReference,
      customer_first_name: "Test",
      customer_last_name: "Customer",
      customer_phone_number: "0771234567",
      customer_email: "test@example.com",
      transaction_redirect_url: "https://example.com/callback",
      additional_data: testOrderId,
    };

    // Make test requests to OnePay API with different auth methods
    const testResults = [];

    // Test with standard JSON request
    try {
      console.log("Testing standard JSON request...");
      const standardResponse = await fetch(API_URL, {
        method: "POST",
        headers: headers.json,
        body: JSON.stringify(testPayload),
      });

      const standardText = await standardResponse.text();
      let standardData;
      try {
        standardData = JSON.parse(standardText);
      } catch (e) {
        standardData = {
          parseError: true,
          text: standardText.substring(0, 100),
        };
      }

      testResults.push({
        method: "Standard JSON",
        status: standardResponse.status,
        statusText: standardResponse.statusText,
        headers: Object.fromEntries([...standardResponse.headers]),
        data: standardData,
      });
    } catch (error) {
      testResults.push({
        method: "Standard JSON",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test with lowercase token
    try {
      console.log("Testing lowercase token...");
      const lowercaseResponse = await fetch(API_URL, {
        method: "POST",
        headers: headers.jsonLowercase,
        body: JSON.stringify(testPayload),
      });

      const lowercaseText = await lowercaseResponse.text();
      let lowercaseData;
      try {
        lowercaseData = JSON.parse(lowercaseText);
      } catch (e) {
        lowercaseData = {
          parseError: true,
          text: lowercaseText.substring(0, 100),
        };
      }

      testResults.push({
        method: "Lowercase Token",
        status: lowercaseResponse.status,
        statusText: lowercaseResponse.statusText,
        data: lowercaseData,
      });
    } catch (error) {
      testResults.push({
        method: "Lowercase Token",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test with basic auth
    try {
      console.log("Testing basic auth...");
      const basicAuthResponse = await fetch(API_URL, {
        method: "POST",
        headers: headers.basicAuth,
        body: JSON.stringify(testPayload),
      });

      const basicAuthText = await basicAuthResponse.text();
      let basicAuthData;
      try {
        basicAuthData = JSON.parse(basicAuthText);
      } catch (e) {
        basicAuthData = {
          parseError: true,
          text: basicAuthText.substring(0, 100),
        };
      }

      testResults.push({
        method: "Basic Auth",
        status: basicAuthResponse.status,
        statusText: basicAuthResponse.statusText,
        data: basicAuthData,
      });
    } catch (error) {
      testResults.push({
        method: "Basic Auth",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test with custom header
    try {
      console.log("Testing custom header...");
      const customHeaderResponse = await fetch(API_URL, {
        method: "POST",
        headers: headers.customHeader,
        body: JSON.stringify(testPayload),
      });

      const customHeaderText = await customHeaderResponse.text();
      let customHeaderData;
      try {
        customHeaderData = JSON.parse(customHeaderText);
      } catch (e) {
        customHeaderData = {
          parseError: true,
          text: customHeaderText.substring(0, 100),
        };
      }

      testResults.push({
        method: "Custom Header",
        status: customHeaderResponse.status,
        statusText: customHeaderResponse.statusText,
        data: customHeaderData,
      });
    } catch (error) {
      testResults.push({
        method: "Custom Header",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Return test results
    return NextResponse.json({
      success: true,
      credentials: {
        appIdPresent: !!APP_ID,
        appIdLength: APP_ID?.length || 0,
        appIdFirstChar: APP_ID ? APP_ID.charAt(0) : "N/A",
        appIdLastChar: APP_ID ? APP_ID.charAt(APP_ID.length - 1) : "N/A",
        appTokenPresent: !!APP_TOKEN,
        appTokenLength: APP_TOKEN?.length || 0,
        appTokenFirstChar: APP_TOKEN ? APP_TOKEN.charAt(0) : "N/A",
        appTokenLastChar: APP_TOKEN
          ? APP_TOKEN.charAt(APP_TOKEN.length - 1)
          : "N/A",
        hashSaltPresent: !!HASH_SALT,
        hashSaltLength: HASH_SALT?.length || 0,
        callbackTokenPresent: !!CALLBACK_TOKEN,
        callbackTokenLength: CALLBACK_TOKEN?.length || 0,
      },
      test: {
        amount: testAmount,
        currency: testCurrency,
        orderId: testOrderId,
        reference: testReference,
        hashCalculation: {
          input: `${maskSensitiveData(
            APP_ID
          )}${testCurrency}${testAmount}${maskSensitiveData(HASH_SALT)}`,
          output: hash,
        },
      },
      testResults,
    });
  } catch (error) {
    console.error("OnePay admin test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Admin test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
