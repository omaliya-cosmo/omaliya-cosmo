import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get OnePay credentials
    const APP_ID = process.env.ONEPAY_APP_ID?.trim();
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN?.trim();
    const HASH_SALT = process.env.ONEPAY_HASH_SALT?.trim();
    const API_URL = "https://api.onepay.lk/v3/checkout/link/";

    // Format reference to be between 10-21 characters
    const reference = `OM${body.orderId.slice(-15)}`;

    // Make sure amount is a whole number for the hash calculation
    const amount = Math.round(body.amount);

    // Calculate hash per OnePay documentation
    const hashInput = `${APP_ID}${body.currency}${amount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Create the OnePay payload with minimal required fields
    const payload = {
      app_id: APP_ID,
      hash: hash,
      currency: body.currency || "LKR",
      amount: amount,
      reference: reference,
      customer_first_name: body.firstName || "Test",
      customer_last_name: body.lastName || "User",
      customer_phone_number: body.phoneNumber || "0771234567",
      customer_email: body.email || "test@example.com",
      transaction_redirect_url:
        body.redirectUrl || "https://omaliya.com/callback",
      additional_data: body.orderId || "TEST12345",
    };

    // Create cURL command for manual testing
    const curlCommand = `curl -X POST \\
  "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${APP_TOKEN}" \\
  -d '${JSON.stringify(payload)}'`;

    // Create authentication info for troubleshooting
    const authHeaders = {
      plain: APP_TOKEN || "",
      bearer: `Bearer ${APP_TOKEN || ""}`,
      basicAuth: `Basic ${Buffer.from(
        `${APP_ID || ""}:${APP_TOKEN || ""}`
      ).toString("base64")}`,
      apiKey: {
        "X-API-Key": APP_TOKEN || "",
      },
    };

    // Return debug information
    return NextResponse.json({
      success: true,
      message: "OnePay debug information generated successfully",
      apiUrl: API_URL,
      requestPayload: {
        ...payload,
        hash: hash.substring(0, 10) + "...", // Mask hash for security
      },
      authOptions: {
        plainToken:
          "***" + (APP_TOKEN || "").substring((APP_TOKEN || "").length - 4),
        bearerFormat:
          "Bearer ***" +
          (APP_TOKEN || "").substring((APP_TOKEN || "").length - 4),
        basicAuthFormat:
          "Basic ***" +
          authHeaders.basicAuth.substring(authHeaders.basicAuth.length - 4),
      },
      curlCommand,
      troubleshootingSteps: [
        "1. Copy the cURL command and execute it in your terminal",
        "2. Check the response for specific error messages",
        "3. Verify the OnePay credentials are correct",
        "4. Ensure the reference format meets OnePay requirements (10-21 chars)",
        "5. Contact OnePay support with the hash calculation and payload format",
      ],
    });
  } catch (error) {
    console.error("OnePay debug error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate debug information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
